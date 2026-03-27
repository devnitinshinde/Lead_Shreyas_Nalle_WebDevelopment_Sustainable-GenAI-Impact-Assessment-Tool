import { NextResponse } from "next/server";
import { validateProxyRequest } from "@/lib/proxy-middleware";
import { logProxyMetrics } from "@/lib/metrics";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const provider = "openai";
    // 1. Validate EcoTrack Key and get Provider Key
    const auth = await validateProxyRequest(request, provider);
    
    // 2. Prepare OpenAI request
    const openaiPath = path.join("/");
    const targetUrl = `https://api.openai.com/${openaiPath}`;
    
    const body = await request.json();
    
    // 3. Forward request to OpenAI
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${auth.providerKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // 4. Async Metrics Logging (SRS FR-26)
    // We don't await this to keep the response fast (NFR-01)
    if (response.ok && data.usage) {
      logProxyMetrics({
        orgId: auth.orgId,
        projectId: auth.projectId,
        provider,
        model: body.model || data.model || "unknown",
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
        region: auth.orgRegion,
        status: "success"
      });
    } else if (!response.ok) {
      logProxyMetrics({
        orgId: auth.orgId,
        projectId: auth.projectId,
        provider,
        model: body.model || "unknown",
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        region: auth.orgRegion,
        status: "failed"
      });
    }

    // 5. Return provider response unchanged (SRS FR-25)
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error("OpenAI Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
