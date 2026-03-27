"use client";

import { useEffect, useState } from "react";
import { TypewriterStream } from "@/components/typewriter-stream";

type Recommendation = {
  id: string;
  type: "model" | "prompt" | "efficiency";
  title: string;
  summary: string;
  expectedImpact: string;
};

type DemoApiResponse = {
  generatedAt: string;
  scenario: {
    id: string;
    name: string;
    description: string;
  };
  availableScenarios: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  insights: {
    totalCalls: number;
    totalTokens: number;
    totalWh: number;
    longPromptRatio: number;
    stagingRatio: number;
  };
  recommendations: Recommendation[];
  aiLayer: {
    enabled: boolean;
    provider: string;
    model: string;
    note?: string;
    executiveSummary: string;
    bestEcoModel: {
      name: string;
      reason: string;
      estimatedSavingsWh: number;
    };
    bestPromptStyle: {
      name: string;
      template: string;
      reason: string;
      estimatedTokenReductionPct: number;
    };
    actionPlan: string[];
  };
};

type StreamMeta = {
  enabled: boolean;
  provider: string;
  model: string;
  note?: string;
  scenario?: string;
};

type StreamEvent =
  | { type: "status"; phase: "starting" }
  | { type: "meta"; enabled: boolean; provider: string; model: string; note?: string; scenario?: string }
  | { type: "line"; text: string }
  | { type: "done" };

export default function RecommendationsPage() {
  const [scenarioId, setScenarioId] = useState("baseline");
  const [data, setData] = useState<DemoApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [streamText, setStreamText] = useState("");
  const [streamMeta, setStreamMeta] = useState<StreamMeta | null>(null);
  const [streamLoading, setStreamLoading] = useState(true);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/recommendations/demo?scenario=${encodeURIComponent(scenarioId)}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to load recommendations");
        }
        const json = (await response.json()) as DemoApiResponse;
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [scenarioId]);

  useEffect(() => {
    const controller = new AbortController();

    const parseAndApplyEvent = (rawLine: string) => {
      if (!rawLine.trim()) {
        return;
      }

      try {
        const event = JSON.parse(rawLine) as StreamEvent;
        if (event.type === "status") {
          return;
        }

        if (event.type === "meta") {
          setStreamMeta({
            enabled: event.enabled,
            provider: event.provider,
            model: event.model,
            note: event.note,
            scenario: event.scenario,
          });
          return;
        }

        if (event.type === "line") {
          setStreamText((current) => `${current}${event.text}\n\n`);
          return;
        }

        if (event.type === "done") {
          setStreamLoading(false);
        }
      } catch {
        setStreamError("Invalid stream chunk received.");
      }
    };

    const startStreaming = async () => {
      setStreamLoading(true);
      setStreamError(null);
      setStreamText("");
      setStreamMeta(null);

      try {
        const response = await fetch(`/api/recommendations/stream?scenario=${encodeURIComponent(scenarioId)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          throw new Error("Failed to stream AI response");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            parseAndApplyEvent(line);
          }
        }

        if (buffer.trim()) {
          parseAndApplyEvent(buffer);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setStreamError(err instanceof Error ? err.message : "Unknown stream error");
      } finally {
        setStreamLoading(false);
      }
    };

    void startStreaming();
    return () => controller.abort();
  }, [scenarioId]);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-7">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Recommendations</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Demo AI-Eco Recommendation Engine</h1>
        <div className="mt-4 max-w-sm">
          <label htmlFor="scenario-select" className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
            Sample Dataset
          </label>
          <select
            id="scenario-select"
            value={scenarioId}
            onChange={(event) => setScenarioId(event.target.value)}
            className="mt-2 w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]"
          >
            {(data?.availableScenarios ?? [
              { id: "baseline", name: "Baseline Mix", description: "Default scenario" },
              { id: "staging-heavy", name: "Staging Heavy", description: "High staging usage" },
              { id: "prompt-heavy", name: "Prompt Heavy", description: "Long-context prompts" },
              { id: "eco-optimized", name: "Eco Optimized", description: "Mostly eco-friendly" },
            ]).map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
          {data ? <p className="mt-2 text-xs text-[color:var(--muted)]">{data.scenario.description}</p> : null}
        </div>

        {loading ? <AiLoadingPanel /> : null}
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        {data ? (
          <>
            <section className="mt-5">
              <div className="flex items-start gap-3">
                <AiLogo className={`mt-0.5 h-6 w-6 text-[color:var(--accent)] ${streamLoading ? "animate-spin" : ""}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">AI Assistant</p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    {streamMeta ? `${streamMeta.provider}:${streamMeta.model}` : "connecting..."}
                  </p>
                  {streamMeta?.note ? <p className="mt-2 text-xs text-amber-300">{streamMeta.note}</p> : null}

                  <div className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]/95">
                    <TypewriterStream
                      text={streamText}
                      speed={[14, 30]}
                      className="whitespace-pre-wrap"
                      cursorClassName="text-[color:var(--accent)]"
                    />
                  </div>

                  {streamLoading ? (
                    <p className="mt-3 inline-flex items-center gap-2 text-xs text-[color:var(--muted)]">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[color:var(--accent)]" />
                      generating next line...
                    </p>
                  ) : null}

                  {streamError ? <p className="mt-2 text-sm text-red-400">{streamError}</p> : null}
                </div>
              </div>
            </section>

            <div className="mt-6 border-t border-[color:var(--line-soft)]" />

            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <Metric title="Total calls" value={String(data.insights.totalCalls)} />
              <Metric title="Total tokens" value={data.insights.totalTokens.toLocaleString()} />
              <Metric title="Energy (Wh)" value={String(data.insights.totalWh)} />
              <Metric title="Long prompt ratio" value={`${data.insights.longPromptRatio}%`} />
            </div>

            <div className="mt-5 space-y-3 text-sm text-[color:var(--foreground)]/90">
              {data.recommendations.map((item) => (
                <article key={item.id} className="rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)]/80 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">{item.type}</p>
                  <h2 className="mt-1 text-base font-semibold">{item.title}</h2>
                  <p className="mt-2">{item.summary}</p>
                  <p className="mt-2 text-[color:var(--muted)]">{item.expectedImpact}</p>
                </article>
              ))}
            </div>

            <p className="mt-4 text-xs text-[color:var(--muted)]">Generated: {new Date(data.generatedAt).toLocaleString()}</p>
          </>
        ) : null}
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
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </article>
  );
}

function AiLoadingPanel() {
  return (
    <section className="mt-5">
      <div className="flex items-center gap-3">
        <AiLogo className="h-7 w-7 animate-spin text-[color:var(--accent)]" />
        <div>
          <p className="text-sm font-medium">AI is analyzing your usage data...</p>
          <p className="text-xs text-[color:var(--muted)]">Preparing live recommendation stream</p>
        </div>
      </div>
    </section>
  );
}

function AiLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2a4 4 0 0 1 4 4v2.1a6.8 6.8 0 0 1 2.9 1.7l1.5-1.5 1.4 1.4-1.5 1.5A6.8 6.8 0 0 1 22 14h-2a4.8 4.8 0 0 0-9.6 0h-2a6.8 6.8 0 0 1 1.7-4.3L8.6 8.2 10 6.8l1.5 1.5A6.8 6.8 0 0 1 14 8.1V6a2 2 0 1 0-4 0v2H8V6a4 4 0 0 1 4-4Zm-1.6 13a3.6 3.6 0 1 0 7.2 0h2a5.6 5.6 0 1 1-11.2 0h2Z" />
    </svg>
  );
}
