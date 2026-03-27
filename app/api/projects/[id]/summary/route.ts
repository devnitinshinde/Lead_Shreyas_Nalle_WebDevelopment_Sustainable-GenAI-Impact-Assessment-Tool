import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    // 1. Verify project exists and belongs to org
    const projectRef = doc(db, "projects", id);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists() || projectSnap.data().orgId !== orgId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = { id, ...projectSnap.data() };

    // 2. Fetch all callLogs for this project
    const logsQuery = query(
      collection(db, "callLogs"),
      where("projectId", "==", id)
    );
    const logsSnap = await getDocs(logsQuery);

    // === EXACT AGGREGATION from Firestore stored values ===
    let totalCalls = 0;
    let successCalls = 0;
    let failedCalls = 0;
    let totalEnergyWh = 0;
    let totalCo2Grams = 0;
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalTokens = 0;
    const modelBreakdown: Record<string, { calls: number; energyWh: number; co2Grams: number }> = {};
    const providerBreakdown: Record<string, number> = {};

    logsSnap.forEach(d => {
      const data = d.data();
      totalCalls++;
      if (data.status === "success") successCalls++;
      else failedCalls++;

      totalEnergyWh += data.energyWh || 0;
      totalCo2Grams += data.co2Grams || 0;
      totalPromptTokens += data.promptTokens || 0;
      totalCompletionTokens += data.completionTokens || 0;
      totalTokens += data.totalTokens || 0;

      if (data.model) {
        if (!modelBreakdown[data.model]) modelBreakdown[data.model] = { calls: 0, energyWh: 0, co2Grams: 0 };
        modelBreakdown[data.model].calls++;
        modelBreakdown[data.model].energyWh += data.energyWh || 0;
        modelBreakdown[data.model].co2Grams += data.co2Grams || 0;
      }

      if (data.provider) {
        providerBreakdown[data.provider] = (providerBreakdown[data.provider] || 0) + 1;
      }
    });

    // 3. Get most recent 20 logs for the project
    const recentLogs = logsSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 20);

    // 4. Fetch project-scoped EcoTrack keys
    const keysQuery = query(
      collection(db, "ecoKeys"),
      where("projectId", "==", id),
      where("revoked", "==", false)
    );
    const keysSnap = await getDocs(keysQuery);
    const keys = keysSnap.docs.map(d => ({
      id: d.id,
      prefix: d.data().keyPrefix,
      name: d.data().name,
      createdAt: d.data().createdAt
    }));

    const sustainabilityScore = totalCalls > 0
      ? Math.max(0, Math.min(100, Math.round(100 - (totalCo2Grams / totalCalls) * 500)))
      : 100;

    return NextResponse.json({
      project: projectData,
      stats: {
        totalCalls,
        successCalls,
        failedCalls,
        totalEnergyWh: Number(totalEnergyWh.toFixed(6)),
        totalEnergyKwh: Number((totalEnergyWh / 1000).toFixed(6)),
        totalCo2Grams: Number(totalCo2Grams.toFixed(6)),
        totalCo2Kg: Number((totalCo2Grams / 1000).toFixed(6)),
        totalPromptTokens,
        totalCompletionTokens,
        totalTokens,
        avgEnergyPerCall: totalCalls > 0 ? Number((totalEnergyWh / totalCalls).toFixed(6)) : 0,
        avgCo2PerCall: totalCalls > 0 ? Number((totalCo2Grams / totalCalls).toFixed(6)) : 0,
        modelBreakdown,
        providerBreakdown,
        sustainabilityScore,
      },
      recentLogs,
      keys,
    });

  } catch (error: any) {
    console.error("Project summary error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
