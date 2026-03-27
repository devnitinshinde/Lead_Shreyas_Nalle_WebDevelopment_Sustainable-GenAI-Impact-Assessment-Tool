import { NextResponse } from "next/server";
import { generateDemoRecommendations } from "@/lib/recommendations-demo";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const scenarioId = url.searchParams.get("scenario") ?? undefined;
    const basePayload = generateDemoRecommendations(scenarioId);
    return NextResponse.json(basePayload);
  } catch {
    return NextResponse.json(
      { error: "Failed to build recommendation demo response." },
      { status: 500 }
    );
  }
}
