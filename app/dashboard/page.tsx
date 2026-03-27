"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import {
  getRecommendationScenario,
  listRecommendationScenarios,
  type RecommendationScenarioId,
} from "@/lib/recommendation-sample-data";
import { generateDemoRecommendations } from "@/lib/recommendations-demo";

type EnrichedLog = {
  id: string;
  projectName: string;
  environment: "production" | "staging";
  modelName: string;
  tokens: number;
  wh: number;
  co2g: number;
  timestamp: string;
};

const CO2_PER_WH_GRAMS = 0.41;
const LONG_PROMPT_THRESHOLD = 1500;

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function isoDayFromTimestamp(timestamp: string): string {
  return timestamp.slice(0, 10);
}

function formatDayLabel(isoDay: string): string {
  return new Date(`${isoDay}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function DashboardPage() {
  const scenarios = useMemo(() => listRecommendationScenarios(), []);
  const [scenarioId, setScenarioId] = useState<RecommendationScenarioId>("baseline");

  const scenario = useMemo(() => getRecommendationScenario(scenarioId), [scenarioId]);
  const recommendationPayload = useMemo(
    () => generateDemoRecommendations(scenarioId),
    [scenarioId]
  );

  const modelWhMap = useMemo(
    () => new Map(scenario.models.map((model) => [model.modelName, model.whPer1kTokens])),
    [scenario.models]
  );

  const enrichedLogs = useMemo<EnrichedLog[]>(() => {
    return scenario.callLogs
      .map((log) => {
        const tokens = log.promptTokens + log.completionTokens;
        const whPer1k = modelWhMap.get(log.modelName) ?? 2.2;
        const wh = (tokens / 1000) * whPer1k;
        const co2g = wh * CO2_PER_WH_GRAMS;

        return {
          id: log.id,
          projectName: log.projectName,
          environment: log.environment,
          modelName: log.modelName,
          tokens,
          wh,
          co2g,
          timestamp: log.timestamp,
        };
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [modelWhMap, scenario.callLogs]);

  const totals = useMemo(() => {
    const totalCalls = enrichedLogs.length;
    const totalTokens = enrichedLogs.reduce((sum, row) => sum + row.tokens, 0);
    const totalWh = enrichedLogs.reduce((sum, row) => sum + row.wh, 0);
    const totalCo2g = enrichedLogs.reduce((sum, row) => sum + row.co2g, 0);
    const stagingCalls = enrichedLogs.filter((row) => row.environment === "staging").length;
    const longPromptCalls = scenario.callLogs.filter((log) => log.promptTokens > LONG_PROMPT_THRESHOLD).length;

    const minWhPer1k = Math.min(...scenario.models.map((model) => model.whPer1kTokens));
    const theoreticalMinWh = (totalTokens / 1000) * minWhPer1k;
    const overheadRatio = theoreticalMinWh > 0 ? (totalWh - theoreticalMinWh) / theoreticalMinWh : 0;
    const stagingRatio = totalCalls > 0 ? stagingCalls / totalCalls : 0;
    const longPromptRatio = totalCalls > 0 ? longPromptCalls / totalCalls : 0;
    const sustainabilityScore = Math.max(
      52,
      Math.min(
        98,
        Math.round(96 - overheadRatio * 34 - stagingRatio * 18 - longPromptRatio * 16)
      )
    );

    return {
      totalCalls,
      totalTokens,
      totalWh: round2(totalWh),
      totalCo2g: round2(totalCo2g),
      longPromptRatioPct: round2(longPromptRatio * 100),
      stagingRatioPct: round2(stagingRatio * 100),
      sustainabilityScore,
    };
  }, [enrichedLogs, scenario.callLogs, scenario.models]);

  const modelBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        modelName: string;
        calls: number;
        tokens: number;
        wh: number;
      }
    >();

    for (const row of enrichedLogs) {
      const current = map.get(row.modelName) ?? {
        modelName: row.modelName,
        calls: 0,
        tokens: 0,
        wh: 0,
      };
      current.calls += 1;
      current.tokens += row.tokens;
      current.wh += row.wh;
      map.set(row.modelName, current);
    }

    return Array.from(map.values())
      .sort((a, b) => b.wh - a.wh)
      .map((row) => ({
        ...row,
        wh: round2(row.wh),
      }));
  }, [enrichedLogs]);

  const projectBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        projectName: string;
        calls: number;
        tokens: number;
        wh: number;
      }
    >();

    for (const row of enrichedLogs) {
      const current = map.get(row.projectName) ?? {
        projectName: row.projectName,
        calls: 0,
        tokens: 0,
        wh: 0,
      };
      current.calls += 1;
      current.tokens += row.tokens;
      current.wh += row.wh;
      map.set(row.projectName, current);
    }

    return Array.from(map.values())
      .sort((a, b) => b.tokens - a.tokens)
      .map((row) => ({
        ...row,
        wh: round2(row.wh),
      }));
  }, [enrichedLogs]);

  const dailyBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        isoDay: string;
        calls: number;
        tokens: number;
        wh: number;
      }
    >();

    for (const row of enrichedLogs) {
      const isoDay = isoDayFromTimestamp(row.timestamp);
      const current = map.get(isoDay) ?? {
        isoDay,
        calls: 0,
        tokens: 0,
        wh: 0,
      };
      current.calls += 1;
      current.tokens += row.tokens;
      current.wh += row.wh;
      map.set(isoDay, current);
    }

    return Array.from(map.values())
      .sort((a, b) => a.isoDay.localeCompare(b.isoDay))
      .map((row) => ({
        ...row,
        label: formatDayLabel(row.isoDay),
        wh: round2(row.wh),
      }));
  }, [enrichedLogs]);

  const topHeavyCalls = useMemo(() => {
    return [...enrichedLogs]
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 6);
  }, [enrichedLogs]);

  const maxModelWh = Math.max(...modelBreakdown.map((row) => row.wh), 1);
  const maxProjectTokens = Math.max(...projectBreakdown.map((row) => row.tokens), 1);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <header className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Dashboard</p>
              <h1 className="mt-1 text-xl font-semibold sm:text-2xl">Sample-Driven Sustainability Monitor</h1>
              <p className="mt-1 text-xs text-[color:var(--muted)]">
                {scenario.name}: {scenario.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/recommendations"
                className="rounded-lg border border-[color:var(--line)] px-3 py-1.5 text-xs hover:border-[color:var(--accent)]"
              >
                Recommendations
              </Link>
              <Link
                href="/charts-demo"
                className="rounded-lg border border-[color:var(--line)] px-3 py-1.5 text-xs hover:border-[color:var(--accent)]"
              >
                Charts Demo
              </Link>
            </div>
          </div>

          <div className="mt-3 max-w-sm">
            <label
              htmlFor="dashboard-scenario"
              className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted)]"
            >
              Sample Scenario
            </label>
            <select
              id="dashboard-scenario"
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
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric title="Total Calls" value={String(totals.totalCalls)} />
          <Metric title="Total Tokens" value={totals.totalTokens.toLocaleString()} />
          <Metric title="Energy (kWh)" value={(totals.totalWh / 1000).toFixed(2)} />
          <Metric title="CO2 (kg)" value={(totals.totalCo2g / 1000).toFixed(2)} />
          <Metric title="Sustainability Score" value={String(totals.sustainabilityScore)} />
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <Card title="Model Energy Share (Wh)">
            <div className="space-y-2.5">
              {modelBreakdown.map((row) => (
                <div key={row.modelName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sky-200">{row.modelName}</span>
                    <span className="text-[color:var(--muted)]">
                      {row.wh} Wh • {row.calls} calls
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[color:var(--line-soft)]">
                    <div
                      className="h-full rounded-full bg-cyan-300/80"
                      style={{ width: `${Math.max(8, (row.wh / maxModelWh) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Project Workload Share (Tokens)">
            <div className="space-y-2.5">
              {projectBreakdown.map((row) => (
                <div key={row.projectName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{row.projectName}</span>
                    <span className="text-[color:var(--muted)]">
                      {row.tokens.toLocaleString()} tokens
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[color:var(--line-soft)]">
                    <div
                      className="h-full rounded-full bg-emerald-300/80"
                      style={{ width: `${Math.max(8, (row.tokens / maxProjectTokens) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Daily Variance (Sample Window)">
            <div className="space-y-1.5 text-xs">
              {dailyBreakdown.map((row) => (
                <div
                  key={row.isoDay}
                  className="grid grid-cols-[72px_1fr_84px] items-center gap-2 rounded-md border border-[color:var(--line-soft)] px-2 py-1.5"
                >
                  <span className="text-[color:var(--muted)]">{row.label}</span>
                  <span>{row.calls} calls • {row.tokens.toLocaleString()} tokens</span>
                  <span className="text-right text-cyan-200">{row.wh} Wh</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Top Heavy Calls (Token Variance)">
            <div className="space-y-1.5 text-xs">
              {topHeavyCalls.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-md border border-[color:var(--line-soft)] px-2 py-1.5"
                >
                  <div>
                    <p className="text-[color:var(--foreground)]">{row.projectName} • {row.modelName}</p>
                    <p className="text-[color:var(--muted)]">{row.environment}</p>
                  </div>
                  <div className="text-right">
                    <p>{row.tokens.toLocaleString()} tok</p>
                    <p className="text-cyan-200">{round2(row.wh)} Wh</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card title="Live Feed (Latest Sample Calls)">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[color:var(--line-soft)] text-left text-xs">
                <thead className="text-[color:var(--muted)]">
                  <tr>
                    <th className="px-2 py-2 font-medium">Model</th>
                    <th className="px-2 py-2 font-medium">Tokens</th>
                    <th className="px-2 py-2 font-medium">Wh</th>
                    <th className="px-2 py-2 font-medium">CO2 (g)</th>
                    <th className="px-2 py-2 font-medium">Project</th>
                    <th className="px-2 py-2 font-medium">Env</th>
                    <th className="px-2 py-2 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--line-soft)]/80">
                  {enrichedLogs.slice(0, 20).map((row) => (
                    <tr key={row.id}>
                      <td className="px-2 py-2 text-sky-200">{row.modelName}</td>
                      <td className="px-2 py-2">{row.tokens.toLocaleString()}</td>
                      <td className="px-2 py-2">{round2(row.wh)}</td>
                      <td className="px-2 py-2">{round2(row.co2g)}</td>
                      <td className="px-2 py-2">{row.projectName}</td>
                      <td className="px-2 py-2">
                        <span className={row.environment === "production" ? "text-emerald-300" : "text-amber-300"}>
                          {row.environment}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-[color:var(--muted)]">
                        {new Date(row.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Recommendation Snapshot">
            <div className="space-y-2 text-xs">
              <p>
                Long prompt ratio: <span className="text-cyan-200">{totals.longPromptRatioPct}%</span>
              </p>
              <p>
                Staging ratio: <span className="text-cyan-200">{totals.stagingRatioPct}%</span>
              </p>
              <div className="space-y-2">
                {recommendationPayload.recommendations.map((item) => (
                  <article key={item.id} className="rounded-md border border-[color:var(--line-soft)] p-2">
                    <p className="font-semibold text-[color:var(--foreground)]">{item.title}</p>
                    <p className="mt-1 text-[color:var(--muted)]">{item.summary}</p>
                    <p className="mt-1 text-cyan-200">{item.expectedImpact}</p>
                  </article>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

type MetricProps = {
  title: string;
  value: string;
};

function Metric({ title, value }: MetricProps) {
  return (
    <article className="rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)]/80 p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--muted)]">{title}</p>
      <p className="mt-1.5 text-xl font-semibold">{value}</p>
    </article>
  );
}

type CardProps = {
  title: string;
  children: ReactNode;
};

function Card({ title, children }: CardProps) {
  return (
    <article className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)]/85 p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </article>
  );
}
