import { NextResponse } from "next/server";
import { validateProxyRequest } from "@/lib/proxy-middleware";
import { logProxyMetrics } from "@/lib/metrics";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const provider = "anthropic";
    // 1. Validate EcoTrack Key
    const auth = await validateProxyRequest(request, provider);
    
    // 2. Prepare Anthropic request
    const anthropicPath = path.join("/");
    const targetUrl = `https://api.anthropic.com/${anthropicPath}`;
    
    const body = await request.json();
    
    // 3. Forward request
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": auth.providerKey,
        "anthropic-version": request.headers.get("anthropic-version") || "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // 4. Async Metrics Logging
    if (response.ok && data.usage) {
      logProxyMetrics({
        orgId: auth.orgId,
        projectId: auth.projectId,
        provider,
        model: body.model || data.model || "unknown",
        promptTokens: data.usage.input_tokens || 0,
        completionTokens: data.usage.output_tokens || 0,
        totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
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

    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error("Anthropic Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
