export type DemoModel = {
  modelName: string;
  provider: "openai" | "anthropic" | "google" | "meta";
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
  | "eco-optimized"
  | "cost-spike"
  | "weekend-batch";

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
  { modelName: "gpt-4o-mini", provider: "openai", whPer1kTokens: 1.45, maxContextTokens: 128000 },
  { modelName: "gemini-2.0-flash-lite", provider: "google", whPer1kTokens: 1.5, maxContextTokens: 1000000 },
  { modelName: "meta-llama-4-scout", provider: "meta", whPer1kTokens: 1.55, maxContextTokens: 128000 },
  { modelName: "claude-3.5-haiku", provider: "anthropic", whPer1kTokens: 1.65, maxContextTokens: 200000 },
];

export const DEFAULT_RECOMMENDATION_SCENARIO: RecommendationScenarioId = "baseline";

function call(
  id: string,
  projectName: string,
  environment: "production" | "staging",
  modelName: string,
  promptTokens: number,
  completionTokens: number,
  timestamp: string
): DemoCallLog {
  return {
    id,
    projectName,
    environment,
    modelName,
    promptTokens,
    completionTokens,
    timestamp,
  };
}

const scenarios: Record<RecommendationScenarioId, RecommendationScenario> = {
  baseline: {
    id: "baseline",
    name: "Practical Week",
    description: "Realistic week-long enterprise usage with mixed workloads and moderate staging traffic.",
    models: recommendationModels,
    callLogs: [
      call("b01", "Support Copilot", "production", "gpt-4o-mini", 540, 220, "2026-03-20T03:50:00.000Z"),
      call("b02", "Order Insights", "production", "claude-sonnet-4", 1480, 420, "2026-03-20T05:30:00.000Z"),
      call("b03", "Knowledge Search", "production", "gemini-2.0-flash", 980, 260, "2026-03-20T07:15:00.000Z"),
      call("b04", "Release QA", "staging", "gpt-4.1", 1620, 500, "2026-03-20T09:10:00.000Z"),
      call("b05", "Support Copilot", "production", "gpt-4o-mini", 610, 240, "2026-03-21T04:20:00.000Z"),
      call("b06", "Mobile Assistant", "production", "gemini-2.0-flash", 840, 250, "2026-03-21T06:05:00.000Z"),
      call("b07", "Finance Reports", "production", "claude-sonnet-4", 1850, 520, "2026-03-21T08:35:00.000Z"),
      call("b08", "Order Insights", "production", "gpt-4o-mini", 720, 260, "2026-03-22T04:40:00.000Z"),
      call("b09", "Knowledge Search", "production", "gemini-2.0-flash", 910, 310, "2026-03-22T07:55:00.000Z"),
      call("b10", "Release QA", "staging", "gpt-4o-mini", 760, 280, "2026-03-22T10:05:00.000Z"),
      call("b11", "Support Copilot", "production", "gpt-4o-mini", 560, 210, "2026-03-23T04:15:00.000Z"),
      call("b12", "Order Insights", "production", "claude-sonnet-4", 1340, 430, "2026-03-23T06:45:00.000Z"),
      call("b13", "Knowledge Search", "production", "gemini-2.0-flash", 1020, 320, "2026-03-23T08:40:00.000Z"),
      call("b14", "Mobile Assistant", "staging", "gpt-4o-mini", 680, 200, "2026-03-23T11:20:00.000Z"),
      call("b15", "Support Copilot", "production", "gpt-4o-mini", 640, 230, "2026-03-24T03:55:00.000Z"),
      call("b16", "Order Insights", "production", "gpt-4.1", 1760, 540, "2026-03-24T05:25:00.000Z"),
      call("b17", "Finance Reports", "production", "claude-sonnet-4", 1960, 560, "2026-03-24T07:05:00.000Z"),
      call("b18", "Knowledge Search", "production", "gemini-2.0-flash", 1080, 330, "2026-03-24T09:10:00.000Z"),
      call("b19", "Release QA", "staging", "gpt-4o-mini", 700, 260, "2026-03-24T12:10:00.000Z"),
      call("b20", "Support Copilot", "production", "gpt-4o-mini", 600, 220, "2026-03-25T04:05:00.000Z"),
      call("b21", "Order Insights", "production", "claude-sonnet-4", 1420, 440, "2026-03-25T06:10:00.000Z"),
      call("b22", "Mobile Assistant", "production", "gemini-2.0-flash", 940, 300, "2026-03-25T08:00:00.000Z"),
      call("b23", "Release QA", "staging", "gpt-4.1", 1680, 510, "2026-03-25T10:35:00.000Z"),
      call("b24", "Support Copilot", "production", "gpt-4o-mini", 590, 210, "2026-03-26T03:45:00.000Z"),
      call("b25", "Finance Reports", "production", "claude-sonnet-4", 1880, 540, "2026-03-26T06:00:00.000Z"),
      call("b26", "Knowledge Search", "production", "gemini-2.0-flash", 970, 300, "2026-03-26T08:45:00.000Z"),
      call("b27", "Order Insights", "production", "gpt-4.1", 1710, 520, "2026-03-27T05:40:00.000Z"),
      call("b28", "Support Copilot", "staging", "gpt-4o-mini", 650, 240, "2026-03-27T09:30:00.000Z"),
    ],
  },
  "staging-heavy": {
    id: "staging-heavy",
    name: "Staging Heavy",
    description: "Regression week with elevated staging traffic during QA and release testing.",
    models: recommendationModels,
    callLogs: [
      call("s01", "Release QA", "staging", "gpt-4.1", 1860, 560, "2026-03-24T05:10:00.000Z"),
      call("s02", "Release QA", "staging", "gpt-4.1", 1720, 520, "2026-03-24T06:30:00.000Z"),
      call("s03", "QA Copilot", "staging", "claude-sonnet-4", 1540, 470, "2026-03-24T08:05:00.000Z"),
      call("s04", "QA Copilot", "staging", "claude-sonnet-4", 1460, 430, "2026-03-24T10:00:00.000Z"),
      call("s05", "Support Copilot", "production", "gpt-4o-mini", 610, 220, "2026-03-24T11:40:00.000Z"),
      call("s06", "Mobile Assistant", "production", "gemini-2.0-flash", 890, 290, "2026-03-25T04:25:00.000Z"),
      call("s07", "Release QA", "staging", "gpt-4.1", 1780, 540, "2026-03-25T06:45:00.000Z"),
      call("s08", "Release QA", "staging", "gpt-4o-mini", 820, 300, "2026-03-25T08:20:00.000Z"),
      call("s09", "Order Insights", "production", "claude-sonnet-4", 1320, 420, "2026-03-25T10:15:00.000Z"),
      call("s10", "QA Copilot", "staging", "claude-sonnet-4", 1490, 450, "2026-03-26T05:35:00.000Z"),
      call("s11", "Support Copilot", "production", "gpt-4o-mini", 570, 210, "2026-03-26T07:10:00.000Z"),
      call("s12", "Release QA", "staging", "gpt-4.1", 1820, 550, "2026-03-26T08:40:00.000Z"),
      call("s13", "Mobile Assistant", "production", "gemini-2.0-flash", 920, 300, "2026-03-26T11:30:00.000Z"),
      call("s14", "QA Copilot", "staging", "gpt-4o-mini", 760, 260, "2026-03-26T13:00:00.000Z"),
    ],
  },
  "prompt-heavy": {
    id: "prompt-heavy",
    name: "Prompt Heavy",
    description: "Documentation and analysis sprint with heavier long-context prompts.",
    models: recommendationModels,
    callLogs: [
      call("p01", "Research Assistant", "production", "gpt-4.1", 3080, 630, "2026-03-24T04:50:00.000Z"),
      call("p02", "Research Assistant", "production", "gpt-4.1", 2920, 590, "2026-03-24T06:05:00.000Z"),
      call("p03", "Policy Analyzer", "production", "claude-sonnet-4", 2740, 540, "2026-03-24T07:40:00.000Z"),
      call("p04", "Policy Analyzer", "staging", "claude-sonnet-4", 2860, 560, "2026-03-24T09:15:00.000Z"),
      call("p05", "Knowledge Search", "production", "gemini-2.0-flash", 1740, 420, "2026-03-25T05:10:00.000Z"),
      call("p06", "Research Assistant", "production", "gpt-4.1", 3180, 660, "2026-03-25T06:45:00.000Z"),
      call("p07", "Support Copilot", "production", "gpt-4o-mini", 980, 290, "2026-03-25T08:20:00.000Z"),
      call("p08", "Policy Analyzer", "production", "claude-sonnet-4", 2610, 520, "2026-03-25T10:40:00.000Z"),
      call("p09", "Research Assistant", "staging", "gpt-4o-mini", 1420, 360, "2026-03-26T04:35:00.000Z"),
      call("p10", "Knowledge Search", "production", "gemini-2.0-flash", 1680, 430, "2026-03-26T07:05:00.000Z"),
      call("p11", "Policy Analyzer", "production", "claude-sonnet-4", 2520, 500, "2026-03-26T09:00:00.000Z"),
      call("p12", "Support Copilot", "production", "gpt-4o-mini", 890, 260, "2026-03-26T11:20:00.000Z"),
    ],
  },
  "eco-optimized": {
    id: "eco-optimized",
    name: "Eco Optimized",
    description: "Mature setup with default low-Wh model routing and trimmed prompts.",
    models: recommendationModels,
    callLogs: [
      call("e01", "Support Copilot", "production", "gpt-4o-mini", 510, 190, "2026-03-25T04:20:00.000Z"),
      call("e02", "Support Copilot", "production", "gpt-4o-mini", 560, 200, "2026-03-25T05:55:00.000Z"),
      call("e03", "Mobile Assistant", "production", "gemini-2.0-flash", 760, 250, "2026-03-25T07:40:00.000Z"),
      call("e04", "Mobile Assistant", "production", "gemini-2.0-flash", 790, 260, "2026-03-25T09:15:00.000Z"),
      call("e05", "Order Insights", "production", "gpt-4o-mini", 690, 230, "2026-03-26T04:30:00.000Z"),
      call("e06", "Order Insights", "production", "gemini-2.0-flash", 880, 290, "2026-03-26T06:20:00.000Z"),
      call("e07", "Knowledge Search", "production", "gemini-2.0-flash", 940, 300, "2026-03-26T08:10:00.000Z"),
      call("e08", "Release QA", "staging", "gpt-4o-mini", 720, 250, "2026-03-26T10:25:00.000Z"),
      call("e09", "Support Copilot", "production", "gpt-4o-mini", 530, 190, "2026-03-27T03:50:00.000Z"),
      call("e10", "Finance Reports", "production", "gemini-2.0-flash", 1180, 360, "2026-03-27T06:00:00.000Z"),
      call("e11", "Knowledge Search", "production", "gemini-2.0-flash", 900, 280, "2026-03-27T08:30:00.000Z"),
      call("e12", "Release QA", "staging", "gpt-4o-mini", 700, 240, "2026-03-27T10:35:00.000Z"),
    ],
  },
  "cost-spike": {
    id: "cost-spike",
    name: "Cost Spike",
    description: "Quarter-end analytics burst causing a temporary production energy spike.",
    models: recommendationModels,
    callLogs: [
      call("cs01", "Support Copilot", "production", "gpt-4o-mini", 580, 220, "2026-03-24T04:20:00.000Z"),
      call("cs02", "Mobile Assistant", "production", "gemini-2.0-flash", 900, 280, "2026-03-24T06:30:00.000Z"),
      call("cs03", "Order Insights", "production", "claude-sonnet-4", 1460, 430, "2026-03-24T08:00:00.000Z"),
      call("cs04", "Quarter Close", "production", "gpt-4.1", 3920, 780, "2026-03-25T04:50:00.000Z"),
      call("cs05", "Quarter Close", "production", "gpt-4.1", 4180, 840, "2026-03-25T06:05:00.000Z"),
      call("cs06", "Quarter Close", "production", "claude-sonnet-4", 3320, 710, "2026-03-25T07:35:00.000Z"),
      call("cs07", "Quarter Close", "production", "gpt-4.1", 4050, 820, "2026-03-25T09:10:00.000Z"),
      call("cs08", "Quarter Close", "staging", "gpt-4o-mini", 950, 300, "2026-03-25T10:55:00.000Z"),
      call("cs09", "Order Insights", "production", "claude-sonnet-4", 1580, 470, "2026-03-26T04:40:00.000Z"),
      call("cs10", "Knowledge Search", "production", "gemini-2.0-flash", 1020, 320, "2026-03-26T06:25:00.000Z"),
      call("cs11", "Support Copilot", "production", "gpt-4o-mini", 610, 230, "2026-03-26T08:15:00.000Z"),
      call("cs12", "Quarter Close", "production", "gpt-4.1", 3810, 760, "2026-03-26T10:20:00.000Z"),
      call("cs13", "Release QA", "staging", "claude-sonnet-4", 1400, 430, "2026-03-26T12:45:00.000Z"),
    ],
  },
  "weekend-batch": {
    id: "weekend-batch",
    name: "Weekend Batch",
    description: "Nightly weekend batch jobs mixed with lighter user-facing traffic.",
    models: recommendationModels,
    callLogs: [
      call("wb01", "Batch ETL", "staging", "gemini-2.0-flash", 2280, 560, "2026-03-21T18:40:00.000Z"),
      call("wb02", "Batch ETL", "staging", "gemini-2.0-flash", 2440, 590, "2026-03-21T20:05:00.000Z"),
      call("wb03", "Report Generator", "production", "gpt-4o-mini", 1020, 300, "2026-03-21T21:30:00.000Z"),
      call("wb04", "Report Generator", "production", "gpt-4o-mini", 1090, 310, "2026-03-21T22:45:00.000Z"),
      call("wb05", "Data Quality", "staging", "claude-sonnet-4", 2120, 540, "2026-03-22T00:20:00.000Z"),
      call("wb06", "Data Quality", "staging", "claude-sonnet-4", 1980, 510, "2026-03-22T01:55:00.000Z"),
      call("wb07", "Support Copilot", "production", "gpt-4o-mini", 600, 220, "2026-03-22T04:10:00.000Z"),
      call("wb08", "Mobile Assistant", "production", "gemini-2.0-flash", 860, 280, "2026-03-22T06:40:00.000Z"),
      call("wb09", "Batch ETL", "staging", "gemini-2.0-flash", 2360, 570, "2026-03-22T19:00:00.000Z"),
      call("wb10", "Report Generator", "production", "gpt-4o-mini", 980, 290, "2026-03-22T21:25:00.000Z"),
      call("wb11", "Data Quality", "staging", "claude-sonnet-4", 2050, 520, "2026-03-23T00:05:00.000Z"),
      call("wb12", "Support Copilot", "production", "gpt-4o-mini", 620, 230, "2026-03-23T05:15:00.000Z"),
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

