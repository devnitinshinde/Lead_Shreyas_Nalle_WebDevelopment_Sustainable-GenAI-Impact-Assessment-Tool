export type DemoModel = {
  modelName: string;
  provider: "openai" | "anthropic" | "google";
  whPer1kTokens: number;
  maxContextTokens: number;
};

export type DemoCallLog = {
  id: string;
  projectName: string;
  environment: "production" | "staging";
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  timestamp: string;
};

export type RecommendationScenarioId =
  | "baseline"
  | "staging-heavy"
  | "prompt-heavy"
  | "eco-optimized";

export type RecommendationScenario = {
  id: RecommendationScenarioId;
  name: string;
  description: string;
  models: DemoModel[];
  callLogs: DemoCallLog[];
};

export const recommendationModels: DemoModel[] = [
  { modelName: "gpt-4.1", provider: "openai", whPer1kTokens: 3.3, maxContextTokens: 128000 },
  { modelName: "claude-sonnet-4", provider: "anthropic", whPer1kTokens: 2.7, maxContextTokens: 200000 },
  { modelName: "gemini-2.0-flash", provider: "google", whPer1kTokens: 1.8, maxContextTokens: 1000000 },
  { modelName: "gpt-4o-mini", provider: "openai", whPer1kTokens: 1.4, maxContextTokens: 128000 },
];

export const DEFAULT_RECOMMENDATION_SCENARIO: RecommendationScenarioId = "baseline";

const scenarios: Record<RecommendationScenarioId, RecommendationScenario> = {
  baseline: {
    id: "baseline",
    name: "Baseline Mix",
    description: "Balanced usage pattern with mixed production and staging traffic.",
    models: recommendationModels,
    callLogs: [
      { id: "c1", projectName: "Core API", environment: "production", modelName: "gpt-4.1", promptTokens: 2300, completionTokens: 640, timestamp: "2026-03-26T10:10:00.000Z" },
      { id: "c2", projectName: "Core API", environment: "production", modelName: "gpt-4.1", promptTokens: 1800, completionTokens: 520, timestamp: "2026-03-26T11:00:00.000Z" },
      { id: "c3", projectName: "Core API", environment: "staging", modelName: "gpt-4.1", promptTokens: 2100, completionTokens: 490, timestamp: "2026-03-26T12:30:00.000Z" },
      { id: "c4", projectName: "Support Bot", environment: "production", modelName: "gpt-4o-mini", promptTokens: 700, completionTokens: 280, timestamp: "2026-03-26T14:20:00.000Z" },
      { id: "c5", projectName: "Support Bot", environment: "production", modelName: "gpt-4o-mini", promptTokens: 640, completionTokens: 250, timestamp: "2026-03-26T15:10:00.000Z" },
      { id: "c6", projectName: "Mobile App", environment: "production", modelName: "gemini-2.0-flash", promptTokens: 910, completionTokens: 320, timestamp: "2026-03-26T16:45:00.000Z" },
      { id: "c7", projectName: "Core API", environment: "staging", modelName: "claude-sonnet-4", promptTokens: 1650, completionTokens: 560, timestamp: "2026-03-27T08:05:00.000Z" },
      { id: "c8", projectName: "Core API", environment: "production", modelName: "gpt-4.1", promptTokens: 2400, completionTokens: 590, timestamp: "2026-03-27T09:40:00.000Z" },
      { id: "c9", projectName: "Support Bot", environment: "staging", modelName: "gpt-4o-mini", promptTokens: 560, completionTokens: 180, timestamp: "2026-03-27T10:25:00.000Z" },
      { id: "c10", projectName: "Mobile App", environment: "production", modelName: "gemini-2.0-flash", promptTokens: 820, completionTokens: 340, timestamp: "2026-03-27T11:55:00.000Z" },
    ],
  },
  "staging-heavy": {
    id: "staging-heavy",
    name: "Staging Heavy",
    description: "High staging usage to test staging waste recommendations.",
    models: recommendationModels,
    callLogs: [
      { id: "s1", projectName: "Core API", environment: "staging", modelName: "gpt-4.1", promptTokens: 2600, completionTokens: 700, timestamp: "2026-03-25T10:00:00.000Z" },
      { id: "s2", projectName: "Core API", environment: "staging", modelName: "gpt-4.1", promptTokens: 2400, completionTokens: 620, timestamp: "2026-03-25T11:20:00.000Z" },
      { id: "s3", projectName: "QA Bot", environment: "staging", modelName: "claude-sonnet-4", promptTokens: 1800, completionTokens: 510, timestamp: "2026-03-25T12:45:00.000Z" },
      { id: "s4", projectName: "QA Bot", environment: "staging", modelName: "claude-sonnet-4", promptTokens: 1700, completionTokens: 470, timestamp: "2026-03-26T09:10:00.000Z" },
      { id: "s5", projectName: "Support Bot", environment: "production", modelName: "gpt-4o-mini", promptTokens: 620, completionTokens: 210, timestamp: "2026-03-26T14:05:00.000Z" },
      { id: "s6", projectName: "Core API", environment: "staging", modelName: "gpt-4.1", promptTokens: 2500, completionTokens: 680, timestamp: "2026-03-26T15:30:00.000Z" },
      { id: "s7", projectName: "Mobile App", environment: "production", modelName: "gemini-2.0-flash", promptTokens: 860, completionTokens: 300, timestamp: "2026-03-27T10:10:00.000Z" },
      { id: "s8", projectName: "Core API", environment: "staging", modelName: "gpt-4.1", promptTokens: 2200, completionTokens: 540, timestamp: "2026-03-27T12:00:00.000Z" },
    ],
  },
  "prompt-heavy": {
    id: "prompt-heavy",
    name: "Prompt Heavy",
    description: "Long-context prompt usage to test prompt compression recommendations.",
    models: recommendationModels,
    callLogs: [
      { id: "p1", projectName: "Research", environment: "production", modelName: "gpt-4.1", promptTokens: 4200, completionTokens: 640, timestamp: "2026-03-24T08:30:00.000Z" },
      { id: "p2", projectName: "Research", environment: "production", modelName: "gpt-4.1", promptTokens: 3900, completionTokens: 590, timestamp: "2026-03-24T09:40:00.000Z" },
      { id: "p3", projectName: "Analytics", environment: "production", modelName: "claude-sonnet-4", promptTokens: 3400, completionTokens: 520, timestamp: "2026-03-25T10:10:00.000Z" },
      { id: "p4", projectName: "Analytics", environment: "staging", modelName: "claude-sonnet-4", promptTokens: 3600, completionTokens: 560, timestamp: "2026-03-25T11:35:00.000Z" },
      { id: "p5", projectName: "Support Bot", environment: "production", modelName: "gpt-4o-mini", promptTokens: 1100, completionTokens: 260, timestamp: "2026-03-26T13:10:00.000Z" },
      { id: "p6", projectName: "Mobile App", environment: "production", modelName: "gemini-2.0-flash", promptTokens: 980, completionTokens: 310, timestamp: "2026-03-27T16:10:00.000Z" },
    ],
  },
  "eco-optimized": {
    id: "eco-optimized",
    name: "Eco Optimized",
    description: "Mostly eco-friendly model usage to test positive-case output.",
    models: recommendationModels,
    callLogs: [
      { id: "e1", projectName: "Support Bot", environment: "production", modelName: "gpt-4o-mini", promptTokens: 620, completionTokens: 190, timestamp: "2026-03-25T08:50:00.000Z" },
      { id: "e2", projectName: "Support Bot", environment: "production", modelName: "gpt-4o-mini", promptTokens: 680, completionTokens: 210, timestamp: "2026-03-25T10:05:00.000Z" },
      { id: "e3", projectName: "Mobile App", environment: "production", modelName: "gemini-2.0-flash", promptTokens: 740, completionTokens: 220, timestamp: "2026-03-26T11:20:00.000Z" },
      { id: "e4", projectName: "Mobile App", environment: "production", modelName: "gemini-2.0-flash", promptTokens: 780, completionTokens: 240, timestamp: "2026-03-26T14:25:00.000Z" },
      { id: "e5", projectName: "Core API", environment: "staging", modelName: "gpt-4o-mini", promptTokens: 690, completionTokens: 230, timestamp: "2026-03-27T09:35:00.000Z" },
      { id: "e6", projectName: "Core API", environment: "production", modelName: "gemini-2.0-flash", promptTokens: 810, completionTokens: 280, timestamp: "2026-03-27T12:10:00.000Z" },
    ],
  },
};

export function listRecommendationScenarios() {
  return Object.values(scenarios).map((scenario) => ({
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
  }));
}

export function getRecommendationScenario(scenarioId?: string): RecommendationScenario {
  if (!scenarioId) {
    return scenarios[DEFAULT_RECOMMENDATION_SCENARIO];
  }

  const candidate = scenarioId as RecommendationScenarioId;
  return scenarios[candidate] ?? scenarios[DEFAULT_RECOMMENDATION_SCENARIO];
}

