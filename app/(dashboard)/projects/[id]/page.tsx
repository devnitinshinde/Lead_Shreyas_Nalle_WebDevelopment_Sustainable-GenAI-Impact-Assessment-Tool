"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useParams } from "next/navigation";

type Stats = {
  totalCalls: number;
  successCalls: number;
  failedCalls: number;
  totalEnergyWh: number;
  totalEnergyKwh: number;
  totalCo2Grams: number;
  totalCo2Kg: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  avgEnergyPerCall: number;
  avgCo2PerCall: number;
  modelBreakdown: Record<string, { calls: number; energyWh: number; co2Grams: number }>;
  providerBreakdown: Record<string, number>;
  sustainabilityScore: number;
};

type ProjectDetail = {
  project: { id: string; name: string; description: string; environment: string; createdAt: any; };
  stats: Stats;
  recentLogs: any[];
  keys: Array<{ id: string; prefix: string; name: string; createdAt: any; }>;
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "docs" | "keys">("overview");
  const [activeLang, setActiveLang] = useState<"curl" | "node" | "python">("curl");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchDetail(user.uid);
      else router.push("/login");
    });
    return () => unsubscribe();
  }, [router, id]);

  async function fetchDetail(orgId: string) {
    try {
      const res = await fetch(`/api/projects/${id}/summary?orgId=${orgId}`);
      if (res.ok) setDetail(await res.json());
    } catch (err) {
      console.error("Failed to fetch project detail:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProject() {
    if (!window.confirm("Delete this project and revoke all associated API keys?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) router.push("/projects");
      else alert("Failed to delete project");
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  const snippets = {
    curl: `curl -X POST http://localhost:3001/api/proxy/test/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_ECOTRACK_KEY" \\
  -H "EcoTrack-Project-Id: ${id}" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}]}'`,
    node: `const openai = new OpenAI({
  baseURL: "http://localhost:3001/api/proxy/openai/v1",
  apiKey: "YOUR_ECOTRACK_KEY",
  defaultHeaders: { "EcoTrack-Project-Id": "${id}" }
});
await openai.chat.completions.create({ model: "gpt-4o", messages: [{ role: "user", content: "Hello" }] });`,
    python: `import requests
r = requests.post("http://localhost:3001/api/proxy/test/v1/chat/completions",
  headers={"Authorization": "Bearer YOUR_ECOTRACK_KEY", "EcoTrack-Project-Id": "${id}"},
  json={"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]}
)
print(r.json())`
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="w-10 h-10 border-2 border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin" />
    </div>
  );

  if (!detail) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-zinc-500">Project not found.</div>
  );

  const { project, stats, recentLogs, keys } = detail;

  return (
    <div className="text-white p-6 sm:p-10 lg:p-14 selection:bg-[#10b981]/30">
      <div className="mx-auto max-w-7xl space-y-10">

        {/* Header */}
        <header className="space-y-5 border-b border-white/5 pb-10">
          <div className="flex items-center justify-between">
            <Link href="/projects" className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold hover:text-white transition-colors">
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg>
              All Projects
            </Link>
            <button
              onClick={handleDeleteProject} disabled={isDeleting}
              className="px-4 py-2 rounded-xl border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </button>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
                <span className="px-2.5 py-1 rounded-lg bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 text-[10px] font-bold uppercase tracking-widest">{project.environment}</span>
              </div>
              <p className="text-[9px] font-mono text-zinc-600 tracking-tighter">PROJECT ID: {id}</p>
              <p className="text-sm text-zinc-500 max-w-2xl font-medium leading-relaxed">{project.description || "No description."}</p>
            </div>
            <div className="flex gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5">
              {(["overview", "logs", "docs", "keys"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab ? "bg-[#10b981] text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-zinc-500 hover:text-white"
                  }`}>{tab}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* KPI Row */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Calls", value: stats.totalCalls.toLocaleString(), sub: `${stats.successCalls} ✓ · ${stats.failedCalls} ✗`, color: "text-white" },
                { label: "Energy Used", value: stats.totalEnergyWh >= 1 ? `${stats.totalEnergyWh.toFixed(3)} Wh` : `${(stats.totalEnergyWh * 1000).toFixed(2)} mWh`, sub: `avg ${stats.avgEnergyPerCall.toFixed(4)} Wh/call`, color: "text-sky-400" },
                { label: "CO₂ Footprint", value: stats.totalCo2Grams >= 1 ? `${stats.totalCo2Grams.toFixed(4)} g` : `${(stats.totalCo2Grams * 1000).toFixed(2)} mg`, sub: `avg ${stats.avgCo2PerCall.toFixed(4)} g/call`, color: "text-orange-400" },
                { label: "Sustainability", value: `${stats.sustainabilityScore}/100`, sub: stats.sustainabilityScore >= 80 ? "🟢 Excellent" : stats.sustainabilityScore >= 60 ? "🟡 Good" : "🔴 Improve", color: "text-[#10b981]" },
              ].map(card => (
                <article key={card.label} className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 hover:border-[#10b981]/30 transition-all group">
                  <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-zinc-500 mb-3">{card.label}</p>
                  <p className={`text-2xl font-bold tracking-tighter tabular-nums ${card.color}`}>{card.value}</p>
                  <p className="text-[9px] text-zinc-600 mt-2">{card.sub}</p>
                </article>
              ))}
            </section>

            {/* Token Summary + Model Breakdown */}
            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-white/5 bg-[#0a0a0a]/60 p-8">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Token Breakdown</h2>
                <div className="space-y-3">
                  {[
                    { label: "Total Tokens", value: stats.totalTokens.toLocaleString() },
                    { label: "Prompt Tokens", value: stats.totalPromptTokens.toLocaleString() },
                    { label: "Completion Tokens", value: stats.totalCompletionTokens.toLocaleString() },
                    { label: "Energy / 1k Tokens", value: `${stats.totalTokens > 0 ? ((stats.totalEnergyWh / stats.totalTokens) * 1000).toFixed(4) : "0"} Wh` },
                    { label: "CO₂ / 1k Tokens", value: `${stats.totalTokens > 0 ? ((stats.totalCo2Grams / stats.totalTokens) * 1000).toFixed(4) : "0"} g` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{row.label}</span>
                      <span className="text-sm font-bold text-white tabular-nums">{row.value}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl border border-white/5 bg-[#0a0a0a]/60 p-8">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Model Performance</h2>
                {Object.keys(stats.modelBreakdown).length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest rounded-2xl border border-dashed border-white/5">Awaiting telemetry</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(stats.modelBreakdown).sort((a, b) => b[1].calls - a[1].calls).map(([model, data]) => (
                      <div key={model} className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                          <span className="text-white font-mono">{model}</span>
                          <span className="text-zinc-500">{data.calls} calls · {data.energyWh.toFixed(4)} Wh · {data.co2Grams.toFixed(4)} gCO₂</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-full"
                            style={{ width: `${Math.min(100, (data.calls / stats.totalCalls) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="animate-in fade-in duration-300">
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0a]/50">
              <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Recent Calls ({recentLogs.length})</h2>
                <div className="flex items-center gap-2 text-[9px] font-bold text-[#10b981]">
                  <div className="w-1 h-1 rounded-full bg-[#10b981]" /> Project Scoped
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      {["Provider", "Model", "Tokens", "Energy (Wh)", "CO₂ (g)", "Status", "Time"].map(h => (
                        <th key={h} className="px-5 py-4 text-left font-bold text-zinc-500 uppercase tracking-widest text-[9px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {recentLogs.length === 0 ? (
                      <tr><td colSpan={7} className="px-6 py-16 text-center text-zinc-600">No calls logged for this project yet.</td></tr>
                    ) : (
                      recentLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-5 py-3">
                            <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${
                              log.provider === "openai" ? "bg-emerald-500/10 text-emerald-400" :
                              log.provider === "anthropic" ? "bg-purple-500/10 text-purple-400" :
                              log.provider === "google" ? "bg-blue-500/10 text-blue-400" :
                              "bg-zinc-800 text-zinc-400"
                            }`}>{log.provider || "test"}</span>
                          </td>
                          <td className="px-5 py-3 font-mono text-[10px] text-zinc-300">{log.model}</td>
                          <td className="px-5 py-3 text-zinc-400 tabular-nums">{(log.totalTokens || 0).toLocaleString()}</td>
                          <td className="px-5 py-3 text-sky-400 tabular-nums font-semibold">{(log.energyWh || 0).toFixed(4)}</td>
                          <td className="px-5 py-3 text-orange-400 tabular-nums font-semibold">{(log.co2Grams || 0).toFixed(4)}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${log.status === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{log.status}</span>
                          </td>
                          <td className="px-5 py-3 text-zinc-500 text-[10px]">
                            {log.createdAt?.seconds ? new Date(log.createdAt.seconds * 1000).toLocaleTimeString() : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Docs Tab */}
        {activeTab === "docs" && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
            <article className="rounded-3xl border border-white/5 bg-[#0a0a0a]/60 p-8">
              <h2 className="text-xl font-bold text-white mb-2">Integration Guide</h2>
              <p className="text-sm text-zinc-500 mb-6">Include <code className="text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded font-mono">EcoTrack-Project-Id: {id}</code> to route all telemetry here.</p>
              <div className="flex gap-2 mb-4">
                {(["curl", "node", "python"] as const).map(lang => (
                  <button key={lang} onClick={() => setActiveLang(lang)}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${activeLang === lang ? "bg-white/10 text-white border border-white/10" : "text-zinc-600 hover:text-white"}`}>{lang}
                  </button>
                ))}
                <button onClick={() => navigator.clipboard.writeText(snippets[activeLang])} className="ml-auto text-[9px] font-bold uppercase tracking-widest text-[#10b981] hover:text-[#34d399] transition-colors">Copy</button>
              </div>
              <pre className="p-6 rounded-2xl bg-[#050505] border border-white/5 text-[11px] font-mono text-zinc-400 overflow-x-auto leading-loose whitespace-pre-wrap">{snippets[activeLang]}</pre>
            </article>
          </div>
        )}

        {/* Keys Tab */}
        {activeTab === "keys" && (
          <div className="space-y-4 max-w-4xl animate-in fade-in duration-300">
            <article className="rounded-3xl border border-white/5 bg-[#0a0a0a]/60 p-8">
              <h2 className="text-xl font-bold text-white mb-1">Project API Keys</h2>
              <p className="text-sm text-zinc-500 mb-8">These keys are pre-scoped to this project — no header needed.</p>
              <div className="space-y-3">
                {keys.length === 0 ? (
                  <p className="text-zinc-500 text-sm h-24 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">No active keys for this project.</p>
                ) : keys.map(key => (
                  <div key={key.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-[#10b981]/20 transition-all">
                    <div>
                      <p className="text-xs font-bold text-white">{key.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">{key.prefix}••••••••••••••••</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(key.prefix)} className="p-2.5 rounded-xl bg-white/5 text-zinc-500 group-hover:text-[#10b981] hover:bg-[#10b981]/10 transition-all">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </article>
          </div>
        )}

      </div>
    </div>
  );
}
