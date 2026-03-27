import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { demoModels } from "@/lib/recommendations-demo";
import type { DemoModel } from "@/lib/recommendation-sample-data";

type ProviderName = "openai" | "groq";

type DemoPayload = {
  models?: DemoModel[];
  insights: {
    totalCalls: number;
    totalTokens: number;
    totalWh: number;
    longPromptRatio: number;
    stagingRatio: number;
    modelUsage: Array<{
      modelName: string;
      totalTokens: number;
      totalWh: number;
      calls: number;
    }>;
  };
  recommendations: Array<{
    id: string;
    type: "model" | "prompt" | "efficiency";
    title: string;
    summary: string;
    expectedImpact: string;
  }>;
};

type AiLayerOptions = {
  strictSample?: boolean;
};

const aiOutputSchema = z.object({
  executiveSummary: z.string(),
  bestEcoModel: z.object({
    name: z.string(),
    reason: z.string(),
    estimatedSavingsWh: z.number(),
  }),
  bestPromptStyle: z.object({
    name: z.string(),
    template: z.string(),
    reason: z.string(),
    estimatedTokenReductionPct: z.number(),
  }),
  actionPlan: z.array(z.string()).min(3).max(5),
});

export type AiLayerOutput = z.infer<typeof aiOutputSchema> & {
  enabled: boolean;
  provider: string;
  model: string;
  note?: string;
};

function resolveProviderConfig() {
  const providerEnv = (process.env.AI_PROVIDER ?? "auto").trim().toLowerCase();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();

  const openaiReady = Boolean(openaiKey && openaiKey.startsWith("sk-"));
  const groqReady = Boolean(groqKey && groqKey.startsWith("gsk_"));

  const preferred: ProviderName =
    providerEnv === "openai" || providerEnv === "groq"
      ? providerEnv
      : groqReady
        ? "groq"
        : "openai";

  if (preferred === "groq" && groqReady) {
    return {
      ok: true as const,
      provider: "groq" as const,
      client: createOpenAI({
        apiKey: groqKey,
        baseURL: process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1",
      }),
      model: process.env.AI_MODEL ?? "openai/gpt-oss-20b",
    };
  }

  if (preferred === "openai" && openaiReady) {
    return {
      ok: true as const,
      provider: "openai" as const,
      client: createOpenAI({ apiKey: openaiKey }),
      model: process.env.AI_MODEL ?? "gpt-4o-mini",
    };
  }

  if (preferred === "groq") {
    return {
      ok: false as const,
      reason: "Missing or invalid GROQ_API_KEY format. Showing simulated AI summary.",
    };
  }

  return {
    ok: false as const,
    reason: "Missing or invalid OPENAI_API_KEY format. Showing simulated AI summary.",
  };
}

function buildFallback(payload: DemoPayload, note?: string, options?: AiLayerOptions): AiLayerOutput {
  const modelRegistry = payload.models?.length ? payload.models : demoModels;
  const topUsage = [...payload.insights.modelUsage].sort((a, b) => b.totalWh - a.totalWh)[0];
  const baselineModel = modelRegistry.find((item) => item.modelName === topUsage?.modelName);
  const baselineWh = baselineModel
    ? ((topUsage?.totalTokens ?? 0) / 1000) * baselineModel.whPer1kTokens
    : 0;

  const candidateTargets = modelRegistry
    .filter((item) => item.modelName !== topUsage?.modelName)
    .map((candidate) => {
      const candidateWh = ((topUsage?.totalTokens ?? 0) / 1000) * candidate.whPer1kTokens;
      const savedWh = Math.max(0, baselineWh - candidateWh);
      return {
        modelName: candidate.modelName,
        provider: candidate.provider,
        whPer1kTokens: candidate.whPer1kTokens,
        estimatedSavingsWh: Number(savedWh.toFixed(2)),
      };
    })
    .sort((a, b) => b.estimatedSavingsWh - a.estimatedSavingsWh);

  const maxSavings = candidateTargets[0]?.estimatedSavingsWh ?? 0;
  const shortlist = candidateTargets.filter((item) =>
    maxSavings > 0 ? item.estimatedSavingsWh >= maxSavings * 0.75 : true
  );

  const providerBalanced = new Map<string, (typeof candidateTargets)[number]>();
  for (const item of shortlist) {
    if (!providerBalanced.has(item.provider)) {
      providerBalanced.set(item.provider, item);
    }
  }

  const topOptions = Array.from(providerBalanced.values()).slice(0, 3);
  if (topOptions.length === 0 && candidateTargets[0]) {
    topOptions.push(candidateTargets[0]);
  }

  const bestEcoLabel = topOptions.length
    ? topOptions.map((item) => `${item.modelName} (${item.provider})`).join(", ")
    : "No lower-Wh alternative in this sample";

  const bestSavingsWh = topOptions[0]?.estimatedSavingsWh ?? 0;
  const longPromptPercent = Number(payload.insights.longPromptRatio.toFixed(2));
  const stagingPercent = Number(payload.insights.stagingRatio.toFixed(2));
  const estimatedTokenReductionPct = longPromptPercent >= 60 ? 28 : longPromptPercent >= 40 ? 24 : longPromptPercent >= 20 ? 18 : 12;

  const actionPlan: string[] = [];
  if (longPromptPercent >= 20) {
    actionPlan.push(
      `Prioritize prompt compression first, since ${longPromptPercent}% of calls are long-context prompts.`
    );
  }
  if (stagingPercent >= 10) {
    actionPlan.push(
      `Route staging traffic (${stagingPercent}% of calls) to lower-Wh models by default.`
    );
  }
  actionPlan.push(
    `Shift high-energy traffic from ${topUsage?.modelName ?? "the top model"} to the best lower-Wh option for that workload.`
  );
  if (topOptions.length > 1) {
    actionPlan.push(
      `Run side-by-side tests on ${topOptions.map((item) => item.modelName).join(", ")} and keep the best quality-per-Wh mix.`
    );
  }

  return {
    enabled: options?.strictSample ? true : false,
    provider: options?.strictSample ? "sample-data" : "fallback",
    model: options?.strictSample ? "local-analytics" : "summary-template",
    executiveSummary: `From the selected sample data: ${payload.insights.totalCalls} calls consumed ${payload.insights.totalTokens} tokens and ${payload.insights.totalWh} Wh. The top energy model is ${topUsage?.modelName ?? "N/A"} (${Number(topUsage?.totalWh ?? 0).toFixed(2)} Wh). Eco recommendation is calculated from per-model Wh and expected savings on this exact scenario.`,
    bestEcoModel: {
      name: bestEcoLabel,
      reason: `Provider-neutral ranking uses only Wh per 1k tokens and estimated savings for the heaviest workload (${topUsage?.modelName ?? "current top model"}), then keeps top options across different providers.`,
      estimatedSavingsWh: bestSavingsWh,
    },
    bestPromptStyle: {
      name: "Goal-Constraints-Output",
      template:
        "Goal: <task>\nConstraints: <bullet limits>\nContext: <only required facts>\nOutput format: <strict JSON/table>\nMax tokens: <limit>",
      reason: `Long-context prompts are ${longPromptPercent}% in this sample. This structure keeps context focused and reduces retries by enforcing explicit output format.`,
      estimatedTokenReductionPct,
    },
    actionPlan,
    note:
      note ??
      (options?.strictSample
        ? "Sample-data mode: summary generated only from scenario metrics."
        : undefined),
  };
}

function toFriendlyAiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const normalized = raw.toLowerCase();

  if (normalized.includes("quota") || normalized.includes("billing")) {
    return "AI quota reached. Showing simulated AI summary.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many requests") || normalized.includes("429")) {
    return "AI rate limit reached. Showing simulated AI summary.";
  }

  if (normalized.includes("timeout") || normalized.includes("aborted")) {
    return "AI response timed out. Showing simulated AI summary.";
  }

  if (normalized.includes("unauthorized") || normalized.includes("api key") || normalized.includes("authentication")) {
    return "AI authentication failed. Check API keys. Showing simulated AI summary.";
  }

  return "AI provider is currently unavailable. Showing simulated AI summary.";
}

export async function generateAiLayer(payload: DemoPayload, options?: AiLayerOptions): Promise<AiLayerOutput> {
  if (options?.strictSample) {
    return buildFallback(payload, undefined, options);
  }

  const timeoutMsRaw = Number(process.env.AI_TIMEOUT_MS ?? "25000");
  const timeoutMs = Number.isFinite(timeoutMsRaw) && timeoutMsRaw > 0 ? timeoutMsRaw : 25000;
  const providerConfig = resolveProviderConfig();

  if (!providerConfig.ok) {
    return buildFallback(payload, providerConfig.reason, options);
  }

  try {
    let controller: AbortController | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (timeoutMs > 0) {
      controller = new AbortController();
      timeoutId = setTimeout(() => controller?.abort("timeout"), timeoutMs);
    }

    const { object } = await generateObject({
      model: providerConfig.client(providerConfig.model),
      schema: aiOutputSchema,
      temperature: 0.2,
      maxRetries: 1,
      abortSignal: controller?.signal,
      prompt: [
        "You are an AI sustainability analyst for LLM workloads.",
        "Use only the provided JSON data. Do not invent unavailable metrics.",
        "Return practical, deployment-ready recommendations.",
        "",
        `DATA: ${JSON.stringify(payload)}`,
      ].join("\n"),
    }).finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });

    return {
      enabled: true,
      provider: providerConfig.provider,
      model: providerConfig.model,
      ...object,
    };
  } catch (error) {
    return buildFallback(payload, toFriendlyAiError(error), options);
  }
}
