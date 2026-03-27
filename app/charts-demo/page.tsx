"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
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
import {
  getRecommendationScenario,
  listRecommendationScenarios,
  type RecommendationScenarioId,
} from "@/lib/recommendation-sample-data";

type DailyUsageRow = {
  dateKey: string;
  dateValue: string;
  calls: number;
  energy: number;
  co2: number;
};

type ModelUsageStats = {
  modelName: string;
  calls: number;
  totalPrompt: number;
  totalTokens: number;
  totalWh: number;
  totalCo2: number;
  whPer1kTokens: number;
};

const pieColors = ["#f5f5f5", "#d4d4d8", "#a1a1aa", "#71717a"];
const radarColors = ["#f5f5f5", "#d4d4d8", "#a1a1aa", "#71717a"];

const tooltipStyle = {
  backgroundColor: "#111111",
  border: "1px solid #2f2f2f",
  borderRadius: "12px",
  color: "#f5f5f5",
};

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function isoDayFromTimestamp(timestamp: string): string {
  return timestamp.slice(0, 10);
}

function toUtcDayLabel(isoDay: string): string {
  const date = new Date(`${isoDay}T00:00:00.000Z`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function listIsoDaysInclusive(startIsoDay: string, endIsoDay: string): string[] {
  const days: string[] = [];
  const cursor = new Date(`${startIsoDay}T00:00:00.000Z`);
  const end = new Date(`${endIsoDay}T00:00:00.000Z`);

  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

function scoreInverse(value: number, min: number, max: number): number {
  if (max === min) {
    return 78;
  }
  return round2(60 + ((max - value) / (max - min)) * 40);
}

function scoreDirect(value: number, min: number, max: number): number {
  if (max === min) {
    return 78;
  }
  return round2(60 + ((value - min) / (max - min)) * 40);
}

export default function ChartsDemoPage() {
  const scenarios = useMemo(() => listRecommendationScenarios(), []);
  const [scenarioId, setScenarioId] = useState<RecommendationScenarioId>("baseline");
  const scenario = useMemo(() => getRecommendationScenario(scenarioId), [scenarioId]);

  const modelWhMap = useMemo(() => {
    return new Map(scenario.models.map((model) => [model.modelName, model.whPer1kTokens]));
  }, [scenario.models]);

  const dailyUsageData = useMemo<DailyUsageRow[]>(() => {
    const map = new Map<string, DailyUsageRow>();

    for (const log of scenario.callLogs) {
      const dayKey = isoDayFromTimestamp(log.timestamp);
      const totalTokens = log.promptTokens + log.completionTokens;
      const whPer1k = modelWhMap.get(log.modelName) ?? 2.2;
      const energy = (totalTokens / 1000) * whPer1k;
      const co2 = energy * 0.41;

      const row = map.get(dayKey) ?? {
        dateKey: toUtcDayLabel(dayKey),
        dateValue: dayKey,
        calls: 0,
        energy: 0,
        co2: 0,
      };

      row.calls += 1;
      row.energy += energy;
      row.co2 += co2;
      map.set(dayKey, row);
    }

    const isoDays = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
    if (isoDays.length === 0) {
      return [];
    }

    const completeRange = listIsoDaysInclusive(isoDays[0], isoDays[isoDays.length - 1]);

    return completeRange
      .map((isoDay) => {
        const row = map.get(isoDay) ?? {
          dateKey: toUtcDayLabel(isoDay),
          dateValue: isoDay,
          calls: 0,
          energy: 0,
          co2: 0,
        };

        return row;
      })
      .map((row) => ({
        ...row,
        energy: round2(row.energy),
        co2: round2(row.co2),
      }));
  }, [modelWhMap, scenario.callLogs]);

  const modelStats = useMemo<ModelUsageStats[]>(() => {
    const map = new Map<string, ModelUsageStats>();

    for (const log of scenario.callLogs) {
      const totalTokens = log.promptTokens + log.completionTokens;
      const whPer1k = modelWhMap.get(log.modelName) ?? 2.2;
      const totalWh = (totalTokens / 1000) * whPer1k;
      const totalCo2 = totalWh * 0.41;

      const current = map.get(log.modelName) ?? {
        modelName: log.modelName,
        calls: 0,
        totalPrompt: 0,
        totalTokens: 0,
        totalWh: 0,
        totalCo2: 0,
        whPer1kTokens: whPer1k,
      };

      current.calls += 1;
      current.totalPrompt += log.promptTokens;
      current.totalTokens += totalTokens;
      current.totalWh += totalWh;
      current.totalCo2 += totalCo2;
      map.set(log.modelName, current);
    }

    return Array.from(map.values())
      .sort((a, b) => b.totalCo2 - a.totalCo2)
      .map((row) => ({
        ...row,
        totalWh: round2(row.totalWh),
        totalCo2: round2(row.totalCo2),
      }));
  }, [modelWhMap, scenario.callLogs]);

  const modelCo2Data = useMemo(
    () => modelStats.map((row) => ({ model: row.modelName, co2: row.totalCo2 })),
    [modelStats]
  );

  const callsByProjectData = useMemo(() => {
    const map = new Map<string, { calls: number; tokens: number }>();
    for (const log of scenario.callLogs) {
      const tokens = log.promptTokens + log.completionTokens;
      const current = map.get(log.projectName) ?? { calls: 0, tokens: 0 };
      current.calls += 1;
      current.tokens += tokens;
      map.set(log.projectName, current);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, calls: value.calls, tokens: value.tokens }))
      .sort((a, b) => b.tokens - a.tokens);
  }, [scenario.callLogs]);

  const activeModelKeys = useMemo(() => {
    return modelStats.slice(0, 3).map((row) => row.modelName);
  }, [modelStats]);

  const modelScoreData = useMemo(() => {
    if (activeModelKeys.length === 0) {
      return [];
    }

    const selected = modelStats.filter((row) => activeModelKeys.includes(row.modelName));
    const byModel = new Map(selected.map((row) => [row.modelName, row]));

    const whValues = selected.map((item) => item.whPer1kTokens);
    const co2Values = selected.map((item) => item.totalCo2);
    const callsValues = selected.map((item) => item.calls);
    const avgPromptValues = selected.map((item) => item.totalPrompt / item.calls);
    const tokenValues = selected.map((item) => item.totalTokens);

    const whMin = Math.min(...whValues);
    const whMax = Math.max(...whValues);
    const co2Min = Math.min(...co2Values);
    const co2Max = Math.max(...co2Values);
    const callsMin = Math.min(...callsValues);
    const callsMax = Math.max(...callsValues);
    const avgPromptMin = Math.min(...avgPromptValues);
    const avgPromptMax = Math.max(...avgPromptValues);
    const tokenMin = Math.min(...tokenValues);
    const tokenMax = Math.max(...tokenValues);

    const metrics: Array<{ metric: string; scorer: (stats: ModelUsageStats) => number }> = [
      { metric: "Efficiency", scorer: (stats) => scoreInverse(stats.whPer1kTokens, whMin, whMax) },
      { metric: "Carbon", scorer: (stats) => scoreInverse(stats.totalCo2, co2Min, co2Max) },
      {
        metric: "Prompt Fit",
        scorer: (stats) => scoreInverse(stats.totalPrompt / stats.calls, avgPromptMin, avgPromptMax),
      },
      { metric: "Adoption", scorer: (stats) => scoreDirect(stats.calls, callsMin, callsMax) },
      { metric: "Workload", scorer: (stats) => scoreDirect(stats.totalTokens, tokenMin, tokenMax) },
    ];

    return metrics.map((metricRow) => {
      const row: Record<string, string | number> = { metric: metricRow.metric };
      for (const modelName of activeModelKeys) {
        const stats = byModel.get(modelName);
        row[modelName] = stats ? metricRow.scorer(stats) : 60;
      }
      return row;
    });
  }, [activeModelKeys, modelStats]);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-7">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Charts Demo</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Scenario-Driven Charts</h1>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Connected to the same sample datasets used in recommendations.
            </p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              {scenario.name}: {scenario.description}
            </p>
            <div className="mt-3 max-w-sm">
              <label htmlFor="chart-scenario-select" className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
                Scenario
              </label>
              <select
                id="chart-scenario-select"
                value={scenarioId}
                onChange={(event) => setScenarioId(event.target.value as RecommendationScenarioId)}
                className="mt-1.5 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-2)] px-3 py-1.5 text-sm outline-none focus:border-[color:var(--accent)]"
              >
                {scenarios.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
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
                <YAxis stroke="#a3a3a3" fontSize={12} allowDecimals={false} />
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

          <ChartCard title="Donut Chart: Workload share by project">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Pie
                  data={callsByProjectData}
                  dataKey="tokens"
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

        <ChartCard title="Radar Chart: Scenario model profile">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={modelScoreData}>
              <PolarGrid stroke="#2f2f2f" />
              <PolarAngleAxis dataKey="metric" stroke="#a3a3a3" />
              <PolarRadiusAxis stroke="#71717a" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {activeModelKeys.map((modelName, index) => (
                <Radar
                  key={modelName}
                  name={modelName}
                  dataKey={modelName}
                  stroke={radarColors[index % radarColors.length]}
                  fill={radarColors[index % radarColors.length]}
                  fillOpacity={0.12}
                />
              ))}
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
