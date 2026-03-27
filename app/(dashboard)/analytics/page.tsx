"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";

type LogEntry = {
  createdAt?: any;
  energyWh?: number;
  co2Grams?: number;
  totalTokens?: number;
  provider?: string;
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeSeriesParams, setTimeSeriesParams] = useState<any[]>([]);
  const [providerData, setProviderData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalEnergy: 0, totalCo2: 0, totalCalls: 0 });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) fetchData(user.uid);
      else router.push("/login");
    });
    return () => unsub();
  }, [router]);

  async function fetchData(orgId: string) {
    try {
      const q = query(collection(db, "callLogs"), where("orgId", "==", orgId));
      const snap = await getDocs(q);
      const logs = snap.docs.map(d => d.data() as LogEntry);

      let eSum = 0; let cSum = 0;
      
      // Daily aggregation for area chart
      const dailyMap: Record<string, { date: string; energyWh: number; co2Grams: number; tokens: number }> = {};
      
      // Provider aggregation for bar chart
      const provMap: Record<string, { provider: string; energyWh: number; co2Grams: number; calls: number }> = {};

      logs.forEach(log => {
        eSum += log.energyWh || 0;
        cSum += log.co2Grams || 0;

        if (log.createdAt?.seconds) {
          const d = new Date(log.createdAt.seconds * 1000);
          const dateStr = `${d.getMonth()+1}/${d.getDate()}`; // short format
          
          if (!dailyMap[dateStr]) dailyMap[dateStr] = { date: dateStr, energyWh: 0, co2Grams: 0, tokens: 0 };
          dailyMap[dateStr].energyWh += (log.energyWh || 0);
          dailyMap[dateStr].co2Grams += (log.co2Grams || 0);
          dailyMap[dateStr].tokens += (log.totalTokens || 0);
        }

        const p = log.provider || "test";
        if (!provMap[p]) provMap[p] = { provider: p.toUpperCase(), energyWh: 0, co2Grams: 0, calls: 0 };
        provMap[p].energyWh += (log.energyWh || 0);
        provMap[p].co2Grams += (log.co2Grams || 0);
        provMap[p].calls++;
      });

      // Sort timeline
      const sortedTimeline = Object.values(dailyMap).sort((a,b) => {
        const [am, ad] = a.date.split('/').map(Number);
        const [bm, bd] = b.date.split('/').map(Number);
        return am === bm ? ad - bd : am - bm;
      });

      setTimeSeriesParams(sortedTimeline);
      setProviderData(Object.values(provMap).sort((a,b) => b.calls - a.calls));
      setSummary({ totalEnergy: eSum, totalCo2: cSum, totalCalls: logs.length });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0a]/90 backdrop-blur border border-white/10 p-4 rounded-2xl shadow-2xl">
          <p className="text-zinc-400 text-xs font-bold mb-2">{label}</p>
          <p className="text-[#10b981] text-sm tabular-nums font-bold">
            ⚡ {payload[0].value.toFixed(4)} Wh
          </p>
          <p className="text-orange-400 text-sm tabular-nums font-bold">
            🌱 {payload[1]?.value.toFixed(4) || 0} gCO₂
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-10 h-10 border-2 border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 sm:px-10 lg:px-14 selection:bg-[#10b981]/30">
      <div className="mx-auto w-full max-w-7xl space-y-10 pb-20">
        
        <header className="flex flex-col gap-1.5 border-b border-white/5 pb-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#10b981] font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
            Visual Intelligence
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-white">
            Sustainability Analytics
          </h1>
          <p className="mt-3 text-sm text-zinc-500 max-w-2xl leading-relaxed font-normal">
            Analyze historical trends, token consumption relative to energy usage, and emissions over time. Use these visual summaries to pinpoint infrastructural inefficiencies.
          </p>
        </header>

        {timeSeriesParams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
            <p className="text-zinc-500 font-medium text-sm">No telemetry data available to plot yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* KPI Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-[#0a0a0a]/60 border border-white/5 backdrop-blur">
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Cumulative Energy</p>
                <p className="text-3xl font-bold text-sky-400 mt-2">{summary.totalEnergy.toFixed(3)} <span className="text-sm">Wh</span></p>
              </div>
              <div className="p-6 rounded-3xl bg-[#0a0a0a]/60 border border-white/5 backdrop-blur">
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Total Emissions</p>
                <p className="text-3xl font-bold text-orange-400 mt-2">{summary.totalCo2.toFixed(3)} <span className="text-sm">g</span></p>
              </div>
              <div className="p-6 rounded-3xl bg-[#0a0a0a]/60 border border-white/5 backdrop-blur">
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Inference Volumes</p>
                <p className="text-3xl font-bold text-white mt-2">{summary.totalCalls.toLocaleString()} <span className="text-sm text-zinc-500">calls</span></p>
              </div>
            </div>

            {/* Time Series Area Chart */}
            <div className="rounded-3xl border border-white/5 bg-[#0a0a0a]/60 p-8 backdrop-blur h-[450px] flex flex-col">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Emissions & Energy Over Time</h2>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesParams} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickMargin={12} axisLine={false} tickLine={false} />
                    <YAxis stroke="#52525b" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Area type="monotone" name="Energy (Wh)" dataKey="energyWh" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" />
                    <Area type="monotone" name="CO₂ (g)" dataKey="co2Grams" stroke="#fb923c" strokeWidth={3} fillOpacity={1} fill="url(#colorCo2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Provider Breakdown Bar Chart */}
            <div className="rounded-3xl border border-white/5 bg-[#0a0a0a]/60 p-8 backdrop-blur h-[400px] flex flex-col">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Provider Impact Breakdown</h2>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={providerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="provider" stroke="#52525b" fontSize={11} tickMargin={12} axisLine={false} tickLine={false} />
                    <YAxis stroke="#52525b" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.02)'}} 
                      contentStyle={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px' }}
                      itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Bar name="Energy (Wh)" dataKey="energyWh" fill="#10b981" radius={[4,4,0,0]} barSize={40} />
                    <Bar name="CO₂ (g)" dataKey="co2Grams" fill="#f59e0b" radius={[4,4,0,0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
