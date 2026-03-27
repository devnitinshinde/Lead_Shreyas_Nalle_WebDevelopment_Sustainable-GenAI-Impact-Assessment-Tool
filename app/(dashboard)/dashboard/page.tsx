"use client";

import { useRouter } from "next/navigation";
import { type ComponentType, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, limit, onSnapshot } from "firebase/firestore";
import { UserProfile } from "@/lib/auth";

type CallLog = {
  id: string;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  energyWh: number;
  co2Grams: number;
  projectId: string | null;
  region: string;
  status: string;
  createdAt: any;
};

type IconProps = { className?: string };

export default function DashboardPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeLogs: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }

        // Real-time listener — no orderBy to avoid composite index requirement
        const q = query(
          collection(db, "callLogs"),
          where("orgId", "==", user.uid)
        );

        unsubscribeLogs = onSnapshot(q, (snapshot) => {
          const data: CallLog[] = snapshot.docs
            .map(d => {
              const r = d.data();
              return {
                id: d.id,
                model: r.model || "unknown",
                provider: r.provider || "unknown",
                promptTokens: r.promptTokens || 0,
                completionTokens: r.completionTokens || 0,
                totalTokens: r.totalTokens || 0,
                energyWh: r.energyWh || 0,
                co2Grams: r.co2Grams || 0,
                projectId: r.projectId || null,
                region: r.region || "global",
                status: r.status || "success",
                createdAt: r.createdAt,
              };
            })
            // Sort client-side — newest first
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setLogs(data);
          setLoading(false);
        }, () => setLoading(false));
      } else {
        router.push("/login");
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeLogs) unsubscribeLogs();
    };
  }, [router]);

  // === EXACT AGGREGATIONS FROM STORED FIRESTORE VALUES ===
  const totalCalls = logs.length;
  const successCalls = logs.filter(l => l.status === "success").length;
  const failedCalls = logs.filter(l => l.status === "failed").length;
  const totalEnergyWh = logs.reduce((s, l) => s + l.energyWh, 0);
  const totalCo2Grams = logs.reduce((s, l) => s + l.co2Grams, 0);
  const totalTokens = logs.reduce((s, l) => s + l.totalTokens, 0);

  // Derived display values
  const totalEnergyKwh = Number((totalEnergyWh / 1000).toFixed(4));
  const totalCo2Kg = Number((totalCo2Grams / 1000).toFixed(4));
  const avgEnergyPerCall = totalCalls > 0 ? Number((totalEnergyWh / totalCalls).toFixed(4)) : 0;

  // Sustainability Score: starts at 100, penalised by CO2 per 1k calls
  const co2Per1kCalls = totalCalls > 0 ? (totalCo2Grams / totalCalls) * 1000 : 0;
  const sustainabilityScore = Math.max(0, Math.min(100, Math.round(100 - co2Per1kCalls * 0.5)));

  // Provider breakdown for mini chart
  const providerCounts: Record<string, number> = {};
  const providerEnergy: Record<string, number> = {};
  logs.forEach(l => {
    providerCounts[l.provider] = (providerCounts[l.provider] || 0) + 1;
    providerEnergy[l.provider] = (providerEnergy[l.provider] || 0) + l.energyWh;
  });

  // Recent 10 for the table
  const recentLogs = logs.slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 animate-pulse font-medium tracking-wide">Syncing telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 sm:px-10 lg:px-14 selection:bg-[#10b981]/30">
      <div className="mx-auto w-full max-w-7xl space-y-10">
        <header className="flex flex-col gap-1.5 border-b border-white/5 pb-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#10b981] font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] animate-pulse" />
            Live Telemetry Buffer
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Sustainability Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 max-w-2xl leading-relaxed">
            Real-time inference energy and carbon tracking across all projects. {totalCalls > 0 && <span className="text-[#10b981] font-semibold">{totalCalls} calls logged.</span>}
          </p>
        </header>

        <div className="space-y-8 pb-20">

          {/* TOP KPI CARDS — exact values from Firestore */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total API Calls"
              value={totalCalls.toLocaleString()}
              sub={`${successCalls} success · ${failedCalls} failed`}
              color="#10b981"
              icon={<SparkIcon className="w-4 h-4" />}
            />
            <MetricCard
              title="Energy Consumed"
              value={totalEnergyWh >= 1000 ? `${totalEnergyKwh} kWh` : `${totalEnergyWh.toFixed(3)} Wh`}
              sub={`avg ${avgEnergyPerCall} Wh / call`}
              color="#60a5fa"
              icon={<ZapIcon className="w-4 h-4" />}
            />
            <MetricCard
              title="CO₂ Footprint"
              value={totalCo2Grams >= 1000 ? `${totalCo2Kg} kg` : `${totalCo2Grams.toFixed(3)} g`}
              sub="from region carbon intensity"
              color="#f97316"
              icon={<LeafIcon className="w-4 h-4" />}
            />
            <MetricCard
              title="Sustainability Score"
              value={`${sustainabilityScore}/100`}
              sub={sustainabilityScore >= 80 ? "🟢 Excellent" : sustainabilityScore >= 60 ? "🟡 Good" : "🔴 Needs work"}
              color="#10b981"
              icon={<ShieldIcon className="w-4 h-4" />}
            />
          </section>

          {/* Provider Breakdown + Token Summary */}
          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-white/5 bg-[#0a0a0a]/60 p-8 backdrop-blur-xl">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Energy by Provider (Wh)</h2>
              {Object.keys(providerEnergy).length === 0 ? (
                <div className="h-32 flex items-center justify-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest rounded-2xl border border-dashed border-white/5">
                  Awaiting first proxy call
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(providerEnergy).sort((a, b) => b[1] - a[1]).map(([prov, wh]) => (
                    <div key={prov} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-white">{prov}</span>
                        <span className="text-zinc-400">{wh.toFixed(4)} Wh · {providerCounts[prov]} calls</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                          style={{ width: `${Math.min(100, (wh / totalEnergyWh) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-3xl border border-white/5 bg-[#0a0a0a]/60 p-8 backdrop-blur-xl">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Token Consumption Summary</h2>
              <div className="space-y-4">
                {[
                  { label: "Total Tokens Processed", value: totalTokens.toLocaleString() },
                  { label: "Prompt Tokens", value: logs.reduce((s, l) => s + l.promptTokens, 0).toLocaleString() },
                  { label: "Completion Tokens", value: logs.reduce((s, l) => s + l.completionTokens, 0).toLocaleString() },
                  { label: "Energy per 1k Tokens", value: `${totalTokens > 0 ? ((totalEnergyWh / totalTokens) * 1000).toFixed(4) : "0"} Wh` },
                  { label: "CO₂ per 1k Tokens", value: `${totalTokens > 0 ? ((totalCo2Grams / totalTokens) * 1000).toFixed(4) : "0"} g` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{row.label}</span>
                    <span className="text-sm font-bold text-white tabular-nums">{row.value}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* Live Telemetry Table */}
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Inference Telemetry</h2>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-bold text-[#10b981]">
                <div className="w-1 h-1 rounded-full bg-[#10b981] animate-pulse" />
                Live · {recentLogs.length} shown
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      {["Provider", "Model", "Tokens", "Prompt", "Completion", "Energy (Wh)", "CO₂ (g)", "Status", "Time"].map(h => (
                        <th key={h} className="px-5 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[9px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {recentLogs.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-16 text-center text-zinc-600 font-medium">
                          No telemetry yet. Send a request through the proxy to see live metrics.
                        </td>
                      </tr>
                    ) : (
                      recentLogs.map(row => (
                        <tr key={row.id} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                              row.provider === "openai" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              row.provider === "anthropic" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                              row.provider === "google" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                              "bg-zinc-800 text-zinc-400 border-white/5"
                            }`}>
                              {row.provider}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[10px] text-zinc-300">{row.model}</td>
                          <td className="px-5 py-3.5 text-zinc-400 font-semibold tabular-nums">{row.totalTokens.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-zinc-500 tabular-nums">{row.promptTokens.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-zinc-500 tabular-nums">{row.completionTokens.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-sky-400 font-semibold tabular-nums">{row.energyWh.toFixed(4)}</td>
                          <td className="px-5 py-3.5 text-orange-400 font-semibold tabular-nums">{row.co2Grams.toFixed(4)}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              row.status === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            }`}>{row.status}</span>
                          </td>
                          <td className="px-5 py-3.5 text-zinc-500 text-[10px]">
                            {row.createdAt?.toDate ? row.createdAt.toDate().toLocaleTimeString() : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, color, icon }: { title: string; value: string; sub: string; color: string; icon: React.ReactNode }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 hover:border-white/20 transition-all group overflow-hidden relative">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-[#10b981] group-hover:border-[#10b981]/20 transition-all">
            {icon}
          </div>
          <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-zinc-500">{title}</p>
        </div>
        <p className="text-2xl font-bold text-white tracking-tighter tabular-nums">{value}</p>
        <p className="text-[9px] text-zinc-600 font-medium">{sub}</p>
      </div>
    </article>
  );
}

const SparkIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const ZapIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const LeafIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const ShieldIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
