import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { demoModels } from "@/lib/recommendations-demo";
import type { DemoModel } from "@/lib/recommendation-sample-data";

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

function buildFallback(payload: DemoPayload, note?: string): AiLayerOutput {
  const modelRegistry = payload.models?.length ? payload.models : demoModels;
  const greenest = [...modelRegistry].sort((a, b) => a.whPer1kTokens - b.whPer1kTokens)[0];
  const topUsage = [...payload.insights.modelUsage].sort((a, b) => b.totalWh - a.totalWh)[0];
  const baselineModel = modelRegistry.find((item) => item.modelName === topUsage?.modelName);
  const baselineWh = baselineModel ? (topUsage.totalTokens / 1000) * baselineModel.whPer1kTokens : 0;
  const greenerWh = (topUsage.totalTokens / 1000) * greenest.whPer1kTokens;
  const estimatedSavingsWh = Math.max(0, Number((baselineWh - greenerWh).toFixed(2)));

  return {
    enabled: false,
    provider: "fallback",
    model: "rule-template",
    executiveSummary:
      "Energy usage is concentrated in a small set of heavier model calls. Moving repeated workloads to a lower-Wh model and tightening prompt structure will reduce token waste quickly.",
    bestEcoModel: {
      name: greenest.modelName,
      reason: `${greenest.modelName} has the lowest Wh per 1k tokens in the registry.`,
      estimatedSavingsWh,
    },
    bestPromptStyle: {
      name: "Goal-Constraints-Output",
      template:
        "Goal: <task>\nConstraints: <bullet limits>\nContext: <only required facts>\nOutput format: <strict JSON/table>\nMax tokens: <limit>",
      reason:
        "This structure cuts unnecessary context and reduces retries by making output format explicit.",
      estimatedTokenReductionPct: 22,
    },
    actionPlan: [
      "Route staging traffic to eco model by default.",
      "Apply prompt template to repeated endpoints first.",
      "Track 7-day Wh/token trend and compare before-after.",
    ],
    note,
  };
}

function toFriendlyAiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const normalized = raw.toLowerCase();

  if (normalized.includes("quota") || normalized.includes("billing")) {
    return "AI quota/billing limit reached. Using fallback mode.";
  }

  if (normalized.includes("timeout") || normalized.includes("aborted")) {
    return "AI response timed out. Using fallback mode.";
  }

  if (normalized.includes("unauthorized") || normalized.includes("api key") || normalized.includes("authentication")) {
    return "AI authentication failed. Check OPENAI_API_KEY and using fallback mode.";
  }

  return "AI provider is currently unavailable. Using fallback mode.";
}

export async function generateAiLayer(payload: DemoPayload): Promise<AiLayerOutput> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const modelName = process.env.AI_MODEL ?? "gpt-4o-mini";
  const apiKeyLooksValid = Boolean(apiKey && apiKey.startsWith("sk-"));

  if (!apiKeyLooksValid) {
    return buildFallback(payload, "Missing or invalid OPENAI_API_KEY format. Using fallback mode.");
  }

  try {
    const openai = createOpenAI({ apiKey });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort("timeout"), 8000);
    const { object } = await generateObject({
      model: openai(modelName),
      schema: aiOutputSchema,
      temperature: 0.2,
      abortSignal: controller.signal,
      prompt: [
        "You are an AI sustainability analyst for LLM workloads.",
        "Use only the provided JSON data. Do not invent unavailable metrics.",
        "Return practical, deployment-ready recommendations.",
        "",
        `DATA: ${JSON.stringify(payload)}`,
      ].join("\n"),
    }).finally(() => clearTimeout(timeoutId));

    return {
      enabled: true,
      provider: "openai",
      model: modelName,
      ...object,
    };
  } catch (error) {
    return buildFallback(payload, toFriendlyAiError(error));
  }
}
