import { NextResponse } from "next/server";
import { generateDemoRecommendations } from "@/lib/recommendations-demo";
import { generateAiLayer } from "@/lib/recommendations-ai";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scenarioId = url.searchParams.get("scenario") ?? undefined;
  const basePayload = generateDemoRecommendations(scenarioId);
  const aiLayer = await generateAiLayer({
    models: basePayload.dataset.models,
    insights: basePayload.insights,
    recommendations: basePayload.recommendations,
  });

  return NextResponse.json({
    ...basePayload,
    aiLayer,
  });
}
