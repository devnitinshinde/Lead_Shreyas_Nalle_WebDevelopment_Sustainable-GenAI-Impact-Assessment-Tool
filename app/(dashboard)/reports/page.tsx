"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

type ReportData = {
  meta: { type: string; date: string; generatedAt: string; orgId: string };
  summary: {
    totalCalls: number; successCalls: number; failedCalls: number;
    totalEnergyWh: number; totalEnergyKwh: number;
    totalCo2Grams: number; totalCo2Kg: number;
    totalPromptTokens: number; totalCompletionTokens: number; totalTokens: number;
    avgEnergyPerCall: number; avgCo2PerCall: number;
    sustainabilityScore: number; co2EquivTreeDays: number;
  };
  breakdown: {
    byModel: Record<string, { calls: number; energyWh: number; co2Grams: number }>;
    byProvider: Record<string, { calls: number; energyWh: number; co2Grams: number }>;
    byProject: Record<string, { calls: number; energyWh: number; co2Grams: number }>;
  };
  trend: Record<string, { calls: number; energyWh: number; co2Grams: number }>;
};

export default function ReportsPage() {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgEmail, setOrgEmail] = useState<string>("");
  const [reportType, setReportType] = useState<"monthly" | "daily">("monthly");
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) { setOrgId(user.uid); setOrgEmail(user.email || ""); }
      else router.push("/login");
    });
    return () => unsub();
  }, [router]);

  async function generateReport() {
    if (!orgId) return;
    setLoading(true);
    setGenerated(false);
    try {
      const res = await fetch(`/api/reports?orgId=${orgId}&type=${reportType}&date=${selectedDate}`);
      if (res.ok) {
        setReport(await res.json());
        setGenerated(true);
      }
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const formatDate = (d: string, type: string) => {
    if (type === "monthly") {
      const [y, m] = d.split("-");
      return new Date(Number(y), Number(m) - 1).toLocaleString("en-US", { month: "long", year: "numeric" });
    }
    return new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const scoreColor = (s: number) => s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <>
      {/* Print CSS — injects a clean print stylesheet */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-area { 
            color: black !important; 
            background: white !important;
            padding: 0 !important;
            font-family: 'Arial', sans-serif;
          }
          .print-area * { color: black !important; background: white !important; border-color: #e5e7eb !important; }
          .print-card { border: 1px solid #e5e7eb !important; border-radius: 8px !important; padding: 16px !important; margin-bottom: 16px !important; break-inside: avoid; }
          .print-header { border-bottom: 2px solid #10b981 !important; padding-bottom: 16px !important; margin-bottom: 24px !important; }
          .eco-accent { color: #10b981 !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #e5e7eb !important; padding: 8px 12px !important; text-align: left !important; font-size: 11px !important; }
          th { background: #f9fafb !important; font-weight: bold !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>

      <div className="p-6 sm:p-10 lg:p-14 max-w-5xl mx-auto space-y-10 pb-24 selection:bg-[#10b981]/30">

        {/* Controls */}
        <div className="no-print space-y-8">
          <header className="border-b border-white/5 pb-8">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#10b981] font-bold mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
              Audit & Compliance
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Sustainability Reports</h1>
            <p className="text-sm text-zinc-500 mt-2 max-w-2xl">Generate auditable daily or monthly reports of AI energy consumption and carbon footprint across all projects.</p>
          </header>

          <div className="rounded-3xl border border-white/5 bg-[#0a0a0a]/60 p-8 space-y-6">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Report Configuration</h2>
            
            <div className="grid gap-6 sm:grid-cols-3 items-end">
              {/* Report Type */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Report Type</label>
                <div className="flex gap-2">
                  {(["monthly", "daily"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        setReportType(t);
                        setGenerated(false);
                        const now = new Date();
                        if (t === "monthly") setSelectedDate(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`);
                        else setSelectedDate(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`);
                      }}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
                        reportType === t ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30" : "bg-white/[0.02] text-zinc-500 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Picker */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                  {reportType === "monthly" ? "Select Month" : "Select Date"}
                </label>
                <input
                  type={reportType === "monthly" ? "month" : "date"}
                  value={selectedDate}
                  onChange={e => { setSelectedDate(e.target.value); setGenerated(false); }}
                  className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#10b981]/50 outline-none transition-all [color-scheme:dark]"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateReport}
                disabled={loading || !orgId}
                className="w-full py-3.5 rounded-xl bg-[#10b981] text-black font-bold text-sm hover:bg-[#34d399] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
              >
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>

          {generated && report && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#10b981]/5 border border-[#10b981]/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center">
                  <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Report ready — {report.summary.totalCalls} calls analyzed</p>
                  <p className="text-[10px] text-zinc-500">Generated at {new Date(report.meta.generatedAt).toLocaleTimeString()}</p>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#10b981] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                Download PDF
              </button>
            </div>
          )}
        </div>

        {/* Report Preview */}
        {generated && report && (
          <div ref={printRef} className="print-area space-y-8">
            
            {/* Report Header */}
            <div className="print-header flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center no-print">
                    <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6v4l3 3"/></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white print:text-black eco-accent">
                      EcoTrack <span style={{color: "#10b981"}}>Sustainability Report</span>
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                      {report.meta.type === "monthly" ? "Monthly" : "Daily"} Audit Report
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-zinc-400"><span className="font-bold text-white">Period:</span> {formatDate(report.meta.date, report.meta.type)}</p>
                  <p className="text-zinc-400"><span className="font-bold text-white">Organization:</span> {orgEmail}</p>
                  <p className="text-zinc-400"><span className="font-bold text-white">Generated:</span> {new Date(report.meta.generatedAt).toLocaleString()}</p>
                  <p className="text-zinc-400"><span className="font-bold text-white">Org ID:</span> <span className="font-mono text-xs">{report.meta.orgId}</span></p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold tabular-nums" style={{ color: scoreColor(report.summary.sustainabilityScore) }}>
                  {report.summary.sustainabilityScore}
                </div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">Sustainability Score</p>
                <p className="text-[10px] text-zinc-600 mt-1">/100</p>
              </div>
            </div>

            {/* KPI Summary Grid */}
            <section>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Executive Summary</h3>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                {[
                  { label: "Total API Calls", value: report.summary.totalCalls.toLocaleString(), sub: `${report.summary.successCalls} success · ${report.summary.failedCalls} failed` },
                  { label: "Energy Consumed", value: report.summary.totalEnergyWh >= 1000 ? `${report.summary.totalEnergyKwh} kWh` : `${report.summary.totalEnergyWh} Wh`, sub: `avg ${report.summary.avgEnergyPerCall} Wh/call` },
                  { label: "CO₂ Emitted", value: report.summary.totalCo2Grams >= 1000 ? `${report.summary.totalCo2Kg} kg` : `${report.summary.totalCo2Grams} g`, sub: `avg ${report.summary.avgCo2PerCall} g/call` },
                  { label: "CO₂ Equivalence", value: `${report.summary.co2EquivTreeDays} days`, sub: "of tree absorption" },
                ].map(card => (
                  <div key={card.label} className="print-card rounded-2xl border border-white/10 bg-[#0a0a0a] p-5">
                    <p className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 mb-2">{card.label}</p>
                    <p className="text-xl font-bold text-white tabular-nums">{card.value}</p>
                    <p className="text-[9px] text-zinc-600 mt-1">{card.sub}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Token Consumption */}
            <section className="print-card rounded-3xl border border-white/5 bg-[#0a0a0a]/60 p-8">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-5">Token Consumption</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "Total Tokens", value: report.summary.totalTokens.toLocaleString() },
                  { label: "Prompt Tokens", value: report.summary.totalPromptTokens.toLocaleString() },
                  { label: "Completion Tokens", value: report.summary.totalCompletionTokens.toLocaleString() },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-2xl font-bold text-white tabular-nums">{item.value}</p>
                    <p className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Provider Breakdown Table */}
            <section className="print-card rounded-3xl border border-white/5 bg-[#0a0a0a]/60 p-8">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-5">Provider Breakdown</h3>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Provider", "Calls", "% of Total", "Energy (Wh)", "CO₂ (g)"].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {Object.entries(report.breakdown.byProvider).map(([prov, data]) => (
                    <tr key={prov} className="hover:bg-white/[0.01]">
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          prov === "openai" ? "bg-emerald-500/10 text-emerald-400" :
                          prov === "anthropic" ? "bg-purple-500/10 text-purple-400" :
                          prov === "google" ? "bg-blue-500/10 text-blue-400" :
                          "bg-zinc-800 text-zinc-400"
                        }`}>{prov}</span>
                      </td>
                      <td className="py-3 px-4 text-white font-semibold tabular-nums">{data.calls}</td>
                      <td className="py-3 px-4 text-zinc-400 tabular-nums">{report.summary.totalCalls > 0 ? ((data.calls / report.summary.totalCalls) * 100).toFixed(1) : 0}%</td>
                      <td className="py-3 px-4 text-sky-400 tabular-nums">{data.energyWh.toFixed(4)}</td>
                      <td className="py-3 px-4 text-orange-400 tabular-nums">{data.co2Grams.toFixed(4)}</td>
                    </tr>
                  ))}
                  {Object.keys(report.breakdown.byProvider).length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-zinc-600">No data for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* Model Breakdown Table */}
            <section className="print-card rounded-3xl border border-white/5 bg-[#0a0a0a]/60 p-8">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-5">Model Performance</h3>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Model", "Calls", "Energy (Wh)", "CO₂ (g)", "gCO₂ / call"].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {Object.entries(report.breakdown.byModel).sort((a, b) => b[1].calls - a[1].calls).map(([model, data]) => (
                    <tr key={model} className="hover:bg-white/[0.01]">
                      <td className="py-3 px-4 font-mono text-[10px] text-zinc-300">{model}</td>
                      <td className="py-3 px-4 text-white font-semibold tabular-nums">{data.calls}</td>
                      <td className="py-3 px-4 text-sky-400 tabular-nums">{data.energyWh.toFixed(4)}</td>
                      <td className="py-3 px-4 text-orange-400 tabular-nums">{data.co2Grams.toFixed(4)}</td>
                      <td className="py-3 px-4 text-zinc-400 tabular-nums">{data.calls > 0 ? (data.co2Grams / data.calls).toFixed(4) : 0}</td>
                    </tr>
                  ))}
                  {Object.keys(report.breakdown.byModel).length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-zinc-600">No data for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* Daily Trend (monthly reports only) */}
            {report.meta.type === "monthly" && Object.keys(report.trend).length > 0 && (
              <section className="print-card rounded-3xl border border-white/5 bg-[#0a0a0a]/60 p-8">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-5">Daily Trend</h3>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Date", "Calls", "Energy (Wh)", "CO₂ (g)"].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {Object.entries(report.trend).sort((a, b) => a[0].localeCompare(b[0])).map(([day, data]) => (
                      <tr key={day}>
                        <td className="py-2.5 px-4 font-mono text-zinc-300 text-[10px]">{day}</td>
                        <td className="py-2.5 px-4 text-white tabular-nums">{data.calls}</td>
                        <td className="py-2.5 px-4 text-sky-400 tabular-nums">{data.energyWh.toFixed(4)}</td>
                        <td className="py-2.5 px-4 text-orange-400 tabular-nums">{data.co2Grams.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Footer */}
            <div className="border-t border-white/5 pt-6 flex items-center justify-between text-[9px] text-zinc-600 font-mono">
              <span>EcoTrack Sustainability Report · Confidential · For Audit Use Only</span>
              <span>Generated: {new Date(report.meta.generatedAt).toLocaleString()}</span>
            </div>

          </div>
        )}

        {/* Empty state */}
        {!generated && !loading && (
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-white/10 bg-white/[0.01] no-print">
            <svg className="w-12 h-12 text-zinc-700 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
            <p className="text-zinc-500 font-medium text-sm">Configure and generate a report above</p>
            <p className="text-zinc-700 text-xs mt-1">Daily and monthly reports available for audit and compliance</p>
          </div>
        )}
      </div>
    </>
  );
}
