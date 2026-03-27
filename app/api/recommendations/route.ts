import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    // Fetch logs for analysis (no orderBy to avoid composite index requirement)
    const logsSnap = await getDocs(
      query(collection(db, "callLogs"), where("orgId", "==", orgId))
    );

    let logs = logsSnap.docs.map(d => d.data());
    // Sort descending by createdAt in memory, limit to 1000
    logs.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    logs = logs.slice(0, 1000);

    if (logs.length === 0) {
      return NextResponse.json({
        recommendations: [{
          id: "no-data",
          type: "info",
          title: "Awaiting Telemetry Data",
          description: "EcoTrack needs inference telemetry to generate personalized sustainability recommendations. Route your AI calls through the proxy to begin.",
          impact: { energySavedWh: 0, co2SavedGrams: 0, costReductionPct: 0 },
          actionText: "View Integration Guide",
          actionLink: "/documentation"
        }]
      });
    }

    const recommendations: any[] = [];
    let totalHeavyModelCalls = 0;
    let heavyModelEnergy = 0;
    
    let totalSmallBatchCalls = 0;
    let smallBatchEnergy = 0;

    let highCarbonRegionCalls = 0;
    let highCarbonEnergy = 0;

    logs.forEach(log => {
      // 1. Model heuristic (detecting large, energy-intensive models)
      const isHeavyModel = log.model?.includes("gpt-4") && !log.model?.includes("mini") && !log.model?.includes("gpt-4o");
      if (isHeavyModel || log.model?.includes("claude-3-opus")) {
        totalHeavyModelCalls++;
        heavyModelEnergy += log.energyWh || 0;
      }

      // 2. Batching heuristic (high frequency, very small token counts)
      if ((log.totalTokens || 0) < 50) {
        totalSmallBatchCalls++;
        smallBatchEnergy += log.energyWh || 0;
      }

      // 3. Region shifting heuristic (global or high carbon regions)
      if (log.region === "global" || log.region?.includes("us-east")) {
        highCarbonRegionCalls++;
        highCarbonEnergy += log.energyWh || 0;
      }
    });

    const totalCalls = logs.length;

    // Generate Model Switching Rec
    if (totalHeavyModelCalls > totalCalls * 0.1) {
      // Assume switching to a smaller model (like 4o-mini) saves ~75% energy
      const estimatedEnergySaved = heavyModelEnergy * 0.75;
      const estimatedCo2Saved = estimatedEnergySaved * 0.39; // approx conversion

      recommendations.push({
        id: "model-switch",
        type: "optimization",
        title: "Model Architecture Downgift",
        description: `We detected ${totalHeavyModelCalls} calls to heavy reasoning models (like GPT-4 or Opus). For tasks not requiring complex reasoning, switching to optimized models like GPT-4o-mini or Claude 3.5 Haiku could cut emissions significantly.`,
        impact: {
          energySavedWh: Number(estimatedEnergySaved.toFixed(2)),
          co2SavedGrams: Number(estimatedCo2Saved.toFixed(2)),
          costReductionPct: 75
        },
        actionText: "Compare Models",
        actionLink: "/documentation"
      });
    }

    // Generate Batching Rec
    if (totalSmallBatchCalls > totalCalls * 0.2) {
      const estimatedEnergySaved = smallBatchEnergy * 0.40; // Approx 40% network/overhead energy saved by batching
      const estimatedCo2Saved = estimatedEnergySaved * 0.39;

      recommendations.push({
        id: "batch-processing",
        type: "efficiency",
        title: "Implement Batch Processing",
        description: `Over ${(totalSmallBatchCalls / totalCalls * 100).toFixed(0)}% of your recent requests contained fewer than 50 tokens. Batching these requests can drastically reduce HTTP overhead and per-request static energy thresholds.`,
        impact: {
          energySavedWh: Number(estimatedEnergySaved.toFixed(2)),
          co2SavedGrams: Number(estimatedCo2Saved.toFixed(2)),
          costReductionPct: 20
        },
        actionText: "View Batching Docs",
        actionLink: "/documentation"
      });
    }

    // Generate Region Shift Rec
    if (highCarbonRegionCalls > totalCalls * 0.3) {
      // European regions can be up to 50% cleaner than average global/us-east
      const estimatedCo2Saved = (highCarbonEnergy * 0.39) * 0.50; 

      recommendations.push({
        id: "region-shift",
        type: "infrastructure",
        title: "Workload Geographic Shifting",
        description: `A large volume of your telemetry is originating from regions with high grid carbon intensity. Shifting async or background jobs to lower-intensity regions (e.g., europe-north1) directly lowers your carbon footprint.`,
        impact: {
          energySavedWh: 0, // Doesn't save energy, just CO2
          co2SavedGrams: Number(estimatedCo2Saved.toFixed(2)),
          costReductionPct: 0 // Often same cost
        },
        actionText: "Analyze Regions",
        actionLink: "/settings"
      });
    }

    // Fallback positive static rec if none triggered
    if (recommendations.length === 0 && totalCalls > 0) {
      recommendations.push({
        id: "optimized",
        type: "success",
        title: "Highly Optimized Infrastructure",
        description: "Your AI workloads are highly efficient based on recent telemetry. No major architectural bottlenecks or heavy-model misuses detected.",
        impact: { energySavedWh: 0, co2SavedGrams: 0, costReductionPct: 0 },
        actionText: "View Dashboard",
        actionLink: "/dashboard"
      });
    }

    return NextResponse.json({ recommendations });

  } catch (error: any) {
    console.error("Recommendations generation error:", error);
    // Return empty array instead of 500 so UI handles gracefully
    return NextResponse.json({ recommendations: [] });
  }
}
