import {
  DEFAULT_RECOMMENDATION_SCENARIO,
  getRecommendationScenario,
  listRecommendationScenarios,
  recommendationModels,
  type DemoCallLog,
  type DemoModel,
} from "@/lib/recommendation-sample-data";

type Recommendation = {
  id: string;
  type: "model" | "prompt" | "efficiency";
  title: string;
  summary: string;
  expectedImpact: string;
};

type ModelUsage = {
  modelName: string;
  totalTokens: number;
  totalWh: number;
  calls: number;
};

type OrgInsights = {
  totalCalls: number;
  totalTokens: number;
  totalWh: number;
  longPromptRatio: number;
  stagingRatio: number;
  modelUsage: ModelUsage[];
};

const LONG_PROMPT_THRESHOLD = 1500;

export const demoModels: DemoModel[] = recommendationModels;
export const demoCallLogs: DemoCallLog[] = getRecommendationScenario(DEFAULT_RECOMMENDATION_SCENARIO).callLogs;

function toWh(totalTokens: number, whPer1kTokens: number): number {
  return (totalTokens / 1000) * whPer1kTokens;
}

function buildInsights(logs: DemoCallLog[], models: DemoModel[]): OrgInsights {
  const totalCalls = logs.length;
  const totalTokens = logs.reduce((sum, log) => sum + log.promptTokens + log.completionTokens, 0);
  const longPromptCalls = logs.filter((log) => log.promptTokens > LONG_PROMPT_THRESHOLD).length;
  const stagingCalls = logs.filter((log) => log.environment === "staging").length;
  const modelMap = new Map<string, ModelUsage>();

  for (const log of logs) {
    const tokens = log.promptTokens + log.completionTokens;
    const model = models.find((item) => item.modelName === log.modelName);
    const wh = model ? toWh(tokens, model.whPer1kTokens) : 0;
    const current = modelMap.get(log.modelName) ?? {
      modelName: log.modelName,
      totalTokens: 0,
      totalWh: 0,
      calls: 0,
    };

    current.totalTokens += tokens;
    current.totalWh += wh;
    current.calls += 1;
    modelMap.set(log.modelName, current);
  }

  const modelUsage = Array.from(modelMap.values()).sort((a, b) => b.totalWh - a.totalWh);
  const totalWh = modelUsage.reduce((sum, row) => sum + row.totalWh, 0);

  return {
    totalCalls,
    totalTokens,
    totalWh,
    longPromptRatio: totalCalls === 0 ? 0 : longPromptCalls / totalCalls,
    stagingRatio: totalCalls === 0 ? 0 : stagingCalls / totalCalls,
    modelUsage,
  };
}

function buildModelRecommendation(insights: OrgInsights, models: DemoModel[]): Recommendation {
  const topEnergyModel = insights.modelUsage[0];
  const topModelDefinition = models.find((m) => m.modelName === topEnergyModel?.modelName);

  const candidateTargets = models
    .filter((model) => model.modelName !== topEnergyModel?.modelName)
    .map((model) => {
      const baselineWh = topEnergyModel && topModelDefinition
        ? toWh(topEnergyModel.totalTokens, topModelDefinition.whPer1kTokens)
        : 0;
      const candidateWh = topEnergyModel ? toWh(topEnergyModel.totalTokens, model.whPer1kTokens) : 0;
      const estimatedSavingsWh = Math.max(0, baselineWh - candidateWh);

      return {
        model,
        estimatedSavingsWh,
      };
    })
    .sort((a, b) => b.estimatedSavingsWh - a.estimatedSavingsWh);

  const maxSavings = candidateTargets[0]?.estimatedSavingsWh ?? 0;
  const shortlist = candidateTargets.filter((item) =>
    maxSavings > 0 ? item.estimatedSavingsWh >= maxSavings * 0.75 : true
  );

  const providerBalanced = new Map<string, (typeof candidateTargets)[number]>();
  for (const item of shortlist) {
    if (!providerBalanced.has(item.model.provider)) {
      providerBalanced.set(item.model.provider, item);
    }
  }

  const topOptions = Array.from(providerBalanced.values()).slice(0, 3);
  if (topOptions.length === 0 && candidateTargets[0]) {
    topOptions.push(candidateTargets[0]);
  }

  const targetLabel = topOptions.length
    ? topOptions.map((item) => `${item.model.modelName} (${item.model.provider})`).join(", ")
    : "a lower-Wh alternative";

  const expectedSavings = topOptions[0]?.estimatedSavingsWh ?? 0;

  return {
    id: "rec-model-switch",
    type: "model",
    title: "Shift heavy workflows to lower-Wh model set",
    summary: `Highest energy usage comes from ${topEnergyModel?.modelName ?? "high-power models"}. Based on provider-neutral Wh analysis for this sample, top eco candidates are ${targetLabel}. Current heavy path runs at ${topModelDefinition?.whPer1kTokens ?? "N/A"} Wh/1k tokens.`,
    expectedImpact: `Estimated savings on current heavy traffic: ${expectedSavings.toFixed(2)} Wh over this sample window.`,
  };
}

function buildPromptRecommendation(insights: OrgInsights): Recommendation {
  const longPromptPercent = (insights.longPromptRatio * 100).toFixed(0);
  const promptMode =
    insights.longPromptRatio > 0.2
      ? "introduce prompt compression + reusable system templates"
      : "keep compact prompts and standardize with short templates";

  return {
    id: "rec-prompt-optimization",
    type: "prompt",
    title: "Adopt eco-friendly prompt pattern",
    summary: `${longPromptPercent}% of calls are long-context prompts (> ${LONG_PROMPT_THRESHOLD} tokens). Best approach: ${promptMode}. Structure prompt as Goal -> Constraints -> Required Output to reduce token waste.`,
    expectedImpact: "Expected token reduction: 15-30% for repeated tasks, directly lowering Wh and CO2.",
  };
}

function buildEfficiencyRecommendation(insights: OrgInsights): Recommendation {
  const stagingPercent = (insights.stagingRatio * 100).toFixed(0);

  return {
    id: "rec-staging-efficiency",
    type: "efficiency",
    title: "Reduce staging energy waste",
    summary: `${stagingPercent}% of traffic is in staging. Route staging calls to low-energy models by default and run full-quality models only for release checks.`,
    expectedImpact: "Expected staging energy reduction: 25-40% without affecting production quality.",
  };
}

export function generateDemoRecommendations(scenarioId?: string) {
  const scenario = getRecommendationScenario(scenarioId);
  const insights = buildInsights(scenario.callLogs, scenario.models);
  const recommendations: Recommendation[] = [
    buildModelRecommendation(insights, scenario.models),
    buildPromptRecommendation(insights),
    buildEfficiencyRecommendation(insights),
  ];

  return {
    generatedAt: new Date().toISOString(),
    scenario: {
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
    },
    availableScenarios: listRecommendationScenarios(),
    dataset: {
      models: scenario.models,
      callLogs: scenario.callLogs,
    },
    insights: {
      totalCalls: insights.totalCalls,
      totalTokens: insights.totalTokens,
      totalWh: Number(insights.totalWh.toFixed(2)),
      longPromptRatio: Number((insights.longPromptRatio * 100).toFixed(2)),
      stagingRatio: Number((insights.stagingRatio * 100).toFixed(2)),
      modelUsage: insights.modelUsage.map((row) => ({
        ...row,
        totalWh: Number(row.totalWh.toFixed(2)),
      })),
    },
    recommendations,
  };
}

