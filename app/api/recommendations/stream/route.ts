import { generateDemoRecommendations } from "@/lib/recommendations-demo";
import { generateAiLayer } from "@/lib/recommendations-ai";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildAiLines(aiLayer: {
  executiveSummary: string;
  bestEcoModel: { name: string; estimatedSavingsWh: number; reason: string };
  bestPromptStyle: { name: string; estimatedTokenReductionPct: number; reason: string };
  actionPlan: string[];
}) {
  const lines: string[] = [];
  lines.push(`AI Summary: ${aiLayer.executiveSummary}`);
  lines.push(
    `Best eco model: ${aiLayer.bestEcoModel.name} (estimated savings ${aiLayer.bestEcoModel.estimatedSavingsWh} Wh).`
  );
  lines.push(`Why model: ${aiLayer.bestEcoModel.reason}`);
  lines.push(
    `Best prompt style: ${aiLayer.bestPromptStyle.name} (${aiLayer.bestPromptStyle.estimatedTokenReductionPct}% token reduction).`
  );
  lines.push(`Why prompt: ${aiLayer.bestPromptStyle.reason}`);
  for (const step of aiLayer.actionPlan) {
    lines.push(`Action: ${step}`);
  }
  return lines;
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
        });
        const lines = buildAiLines(aiLayer);

        push({
          type: "meta",
          enabled: aiLayer.enabled,
          provider: aiLayer.provider,
          model: aiLayer.model,
          note: aiLayer.note,
          scenario: basePayload.scenario.id,
        });

        for (const line of lines) {
          push({ type: "line", text: line });
          await sleep(220);
        }

        push({ type: "done" });
      } catch {
        push({ type: "meta", enabled: false, provider: "fallback", model: "rule-template", note: "Stream failed, fallback stream ended." });
        push({ type: "line", text: "AI stream failed. Please retry." });
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
