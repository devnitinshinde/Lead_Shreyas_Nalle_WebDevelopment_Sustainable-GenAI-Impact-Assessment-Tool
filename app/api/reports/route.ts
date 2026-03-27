import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const type = searchParams.get("type") || "monthly"; // daily | monthly
    const date = searchParams.get("date"); // YYYY-MM for monthly, YYYY-MM-DD for daily

    if (!orgId || !date) {
      return NextResponse.json({ error: "Missing orgId or date" }, { status: 400 });
    }

    // Fetch all callLogs for this org
    const logsSnap = await getDocs(
      query(collection(db, "callLogs"), where("orgId", "==", orgId))
    );

    // Filter by date range
    const allLogs = logsSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));

    const filtered = allLogs.filter(log => {
      if (!log.createdAt?.seconds) return false;
      const logDate = new Date(log.createdAt.seconds * 1000);
      const yyyy = logDate.getFullYear();
      const mm = String(logDate.getMonth() + 1).padStart(2, "0");
      const dd = String(logDate.getDate()).padStart(2, "0");

      if (type === "monthly") {
        return `${yyyy}-${mm}` === date;
      } else {
        return `${yyyy}-${mm}-${dd}` === date;
      }
    });

    // === AGGREGATIONS ===
    let totalCalls = filtered.length;
    let successCalls = filtered.filter(l => l.status === "success").length;
    let failedCalls = filtered.filter(l => l.status === "failed").length;
    let totalEnergyWh = 0;
    let totalCo2Grams = 0;
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalTokens = 0;

    const modelBreakdown: Record<string, { calls: number; energyWh: number; co2Grams: number }> = {};
    const providerBreakdown: Record<string, { calls: number; energyWh: number; co2Grams: number }> = {};
    const projectBreakdown: Record<string, { calls: number; energyWh: number; co2Grams: number }> = {};
    
    // Group by day for trend chart data
    const dailyTrend: Record<string, { calls: number; energyWh: number; co2Grams: number }> = {};

    filtered.forEach(log => {
      totalEnergyWh += log.energyWh || 0;
      totalCo2Grams += log.co2Grams || 0;
      totalPromptTokens += log.promptTokens || 0;
      totalCompletionTokens += log.completionTokens || 0;
      totalTokens += log.totalTokens || 0;

      const model = log.model || "unknown";
      if (!modelBreakdown[model]) modelBreakdown[model] = { calls: 0, energyWh: 0, co2Grams: 0 };
      modelBreakdown[model].calls++;
      modelBreakdown[model].energyWh += log.energyWh || 0;
      modelBreakdown[model].co2Grams += log.co2Grams || 0;

      const provider = log.provider || "unknown";
      if (!providerBreakdown[provider]) providerBreakdown[provider] = { calls: 0, energyWh: 0, co2Grams: 0 };
      providerBreakdown[provider].calls++;
      providerBreakdown[provider].energyWh += log.energyWh || 0;
      providerBreakdown[provider].co2Grams += log.co2Grams || 0;

      const project = log.projectId || "unscoped";
      if (!projectBreakdown[project]) projectBreakdown[project] = { calls: 0, energyWh: 0, co2Grams: 0 };
      projectBreakdown[project].calls++;
      projectBreakdown[project].energyWh += log.energyWh || 0;
      projectBreakdown[project].co2Grams += log.co2Grams || 0;

      // Daily group key
      if (log.createdAt?.seconds) {
        const d = new Date(log.createdAt.seconds * 1000);
        const dayKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        if (!dailyTrend[dayKey]) dailyTrend[dayKey] = { calls: 0, energyWh: 0, co2Grams: 0 };
        dailyTrend[dayKey].calls++;
        dailyTrend[dayKey].energyWh += log.energyWh || 0;
        dailyTrend[dayKey].co2Grams += log.co2Grams || 0;
      }
    });

    const sustainabilityScore = totalCalls > 0
      ? Math.max(0, Math.min(100, Math.round(100 - (totalCo2Grams / totalCalls) * 500)))
      : 100;
    
    const co2EquivTreeDays = Number((totalCo2Grams / 21.77).toFixed(2)); // avg tree absorbs 21.77g CO2/day

    return NextResponse.json({
      meta: {
        type,
        date,
        generatedAt: new Date().toISOString(),
        orgId,
      },
      summary: {
        totalCalls,
        successCalls,
        failedCalls,
        totalEnergyWh: Number(totalEnergyWh.toFixed(4)),
        totalEnergyKwh: Number((totalEnergyWh / 1000).toFixed(6)),
        totalCo2Grams: Number(totalCo2Grams.toFixed(4)),
        totalCo2Kg: Number((totalCo2Grams / 1000).toFixed(6)),
        totalPromptTokens,
        totalCompletionTokens,
        totalTokens,
        avgEnergyPerCall: totalCalls > 0 ? Number((totalEnergyWh / totalCalls).toFixed(4)) : 0,
        avgCo2PerCall: totalCalls > 0 ? Number((totalCo2Grams / totalCalls).toFixed(4)) : 0,
        sustainabilityScore,
        co2EquivTreeDays,
      },
      breakdown: {
        byModel: modelBreakdown,
        byProvider: providerBreakdown,
        byProject: projectBreakdown,
      },
      trend: dailyTrend,
    });

  } catch (error: any) {
    console.error("Report generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
