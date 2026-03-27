"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { format, subDays } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const baseDate = new Date(2026, 2, 27);

const dailyUsageData = Array.from({ length: 14 }, (_, index) => {
  const day = subDays(baseDate, 13 - index);
  const calls = 820 + index * 58 + (index % 3) * 42;
  const energy = Number((calls * 0.014 + (index % 4) * 0.26).toFixed(2));
  const co2 = Number((energy * 0.41).toFixed(2));

  return {
    dateKey: format(day, "MMM d"),
    calls,
    energy,
    co2,
  };
});

const modelCo2Data = [
  { model: "gpt-4.1", co2: 32.4 },
  { model: "claude-sonnet-4", co2: 24.1 },
  { model: "gemini-2.0-flash", co2: 18.2 },
  { model: "gpt-4o-mini", co2: 11.7 },
];

const callsByProjectData = [
  { name: "Core API", calls: 8420 },
  { name: "Mobile Assistant", calls: 3960 },
  { name: "Support Bot", calls: 2310 },
  { name: "Batch Jobs", calls: 1880 },
];

const modelScoreData = [
  { metric: "Efficiency", "gpt-4.1": 58, claude: 74, gemini: 82 },
  { metric: "Latency", "gpt-4.1": 63, claude: 72, gemini: 86 },
  { metric: "CO2", "gpt-4.1": 52, claude: 70, gemini: 84 },
  { metric: "Cost", "gpt-4.1": 49, claude: 67, gemini: 80 },
  { metric: "Stability", "gpt-4.1": 88, claude: 84, gemini: 78 },
];

const pieColors = ["#f5f5f5", "#d4d4d8", "#a1a1aa", "#71717a"];

const tooltipStyle = {
  backgroundColor: "#111111",
  border: "1px solid #2f2f2f",
  borderRadius: "12px",
  color: "#f5f5f5",
};

export default function ChartsDemoPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-7">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Charts Demo</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Recharts + date-fns UI Kit</h1>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Responsive chart components ready to reuse in dashboard pages.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)]"
          >
            Back to dashboard
          </Link>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Line Chart: Daily API calls">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyUsageData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#242424" strokeDasharray="4 4" />
                <XAxis dataKey="dateKey" stroke="#a3a3a3" fontSize={12} />
                <YAxis stroke="#a3a3a3" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="calls" stroke="#f4f4f5" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Area Chart: Energy and CO2 trend">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyUsageData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e4e4e7" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#e4e4e7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#242424" strokeDasharray="4 4" />
                <XAxis dataKey="dateKey" stroke="#a3a3a3" fontSize={12} />
                <YAxis stroke="#a3a3a3" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="energy" stroke="#f5f5f5" fill="url(#energyGradient)" />
                <Area type="monotone" dataKey="co2" stroke="#a1a1aa" fill="url(#co2Gradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Bar Chart: CO2 by model">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={modelCo2Data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#242424" strokeDasharray="4 4" />
                <XAxis dataKey="model" stroke="#a3a3a3" fontSize={12} />
                <YAxis stroke="#a3a3a3" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="co2" fill="#e4e4e7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Donut Chart: Calls by project">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Pie
                  data={callsByProjectData}
                  dataKey="calls"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={102}
                  paddingAngle={3}
                >
                  {callsByProjectData.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        <ChartCard title="Radar Chart: Model comparison (sample)">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={modelScoreData}>
              <PolarGrid stroke="#2f2f2f" />
              <PolarAngleAxis dataKey="metric" stroke="#a3a3a3" />
              <PolarRadiusAxis stroke="#71717a" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Radar name="GPT-4.1" dataKey="gpt-4.1" stroke="#f5f5f5" fill="#f5f5f5" fillOpacity={0.2} />
              <Radar name="Claude" dataKey="claude" stroke="#d4d4d8" fill="#d4d4d8" fillOpacity={0.15} />
              <Radar name="Gemini" dataKey="gemini" stroke="#a1a1aa" fill="#a1a1aa" fillOpacity={0.12} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

type ChartCardProps = {
  title: string;
  children: ReactNode;
};

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <article className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/85 p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </article>
  );
}
