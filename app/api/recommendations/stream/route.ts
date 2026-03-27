import { generateDemoRecommendations } from "@/lib/recommendations-demo";
import { generateAiLayer } from "@/lib/recommendations-ai";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildAiSummaryParagraph(aiLayer: {
  executiveSummary: string;
  bestEcoModel: { name: string; estimatedSavingsWh: number; reason: string };
  bestPromptStyle: { name: string; estimatedTokenReductionPct: number; reason: string };
  actionPlan: string[];
}, insights: {
  totalCalls: number;
  totalTokens: number;
  totalWh: number;
  longPromptRatio: number;
  stagingRatio: number;
}, scenarioName: string) {
  const actions = aiLayer.actionPlan
    .slice(0, 3)
    .map((step) => step.replace(/[.]+$/g, ""))
    .join("; ");
  return [
    `Scenario ${scenarioName}: sample data shows ${insights.totalCalls} calls, ${insights.totalTokens} tokens, and ${insights.totalWh} Wh total energy.`,
    `Long-context prompts are ${insights.longPromptRatio}% and staging traffic is ${insights.stagingRatio}%.`,
    `Best eco options are ${aiLayer.bestEcoModel.name} with estimated savings of ${aiLayer.bestEcoModel.estimatedSavingsWh} Wh on this sample.`,
    `Model basis: ${aiLayer.bestEcoModel.reason}`,
    `Best prompt style is ${aiLayer.bestPromptStyle.name} with ~${aiLayer.bestPromptStyle.estimatedTokenReductionPct}% token reduction for this scenario.`,
    `Reason: ${aiLayer.bestPromptStyle.reason}`,
    `Next steps: ${actions}.`,
  ].join(" ");
}

function chunkText(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += chunkSize) {
    chunks.push(text.slice(index, index + chunkSize));
  }
  return chunks;
}

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const url = new URL(request.url);
  const scenarioId = url.searchParams.get("scenario") ?? undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const push = (payload: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      };

      try {
        push({
          type: "status",
          phase: "starting",
        });

        const basePayload = generateDemoRecommendations(scenarioId);
        const aiLayer = await generateAiLayer({
          models: basePayload.dataset.models,
          insights: basePayload.insights,
          recommendations: basePayload.recommendations,
        }, {
          strictSample: true,
        });
        const paragraph = buildAiSummaryParagraph(aiLayer, basePayload.insights, basePayload.scenario.name);
        const chunks = chunkText(paragraph, 70);

        push({
          type: "meta",
          enabled: aiLayer.enabled,
          provider: aiLayer.provider,
          model: aiLayer.model,
          note: aiLayer.note,
          scenario: basePayload.scenario.id,
        });

        for (const chunk of chunks) {
          push({ type: "line", text: chunk });
          await sleep(90);
        }

        push({ type: "done" });
      } catch {
        push({
          type: "meta",
          enabled: false,
          provider: "fallback",
          model: "summary-template",
          note: "Could not stream AI result right now, showing simulated AI summary.",
        });
        push({ type: "line", text: "AI stream failed. Please retry after a moment." });
        push({ type: "done" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
