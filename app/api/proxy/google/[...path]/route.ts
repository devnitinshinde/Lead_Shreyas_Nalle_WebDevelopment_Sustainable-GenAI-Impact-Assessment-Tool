import { NextResponse } from "next/server";
import { validateProxyRequest } from "@/lib/proxy-middleware";
import { logProxyMetrics } from "@/lib/metrics";

async function handleRequest(
  request: Request,
  params: Promise<{ path: string[] }>,
  method: "GET" | "POST"
) {
  try {
    const { path } = await params;
    const provider = "google";
    const auth = await validateProxyRequest(request, provider);

    const googlePath = path.join("/");
    const targetUrl = `https://generativelanguage.googleapis.com/${googlePath}?key=${auth.providerKey}`;

    const fetchOpts: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": auth.providerKey,
      },
    };

    let body: any = null;
    if (method === "POST") {
      body = await request.json();
      fetchOpts.body = JSON.stringify(body);
    }

    const response = await fetch(targetUrl, fetchOpts);
    const data = await response.json();

    // Log metrics only for POST (inference calls)
    if (method === "POST") {
      if (response.ok && data.usageMetadata) {
        logProxyMetrics({
          orgId: auth.orgId,
          projectId: auth.projectId,
          provider,
          model: body?.model || "gemini",
          promptTokens: data.usageMetadata.promptTokenCount || 0,
          completionTokens: data.usageMetadata.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata.totalTokenCount || 0,
          region: auth.orgRegion,
          status: "success"
        });
      } else if (!response.ok) {
        logProxyMetrics({
          orgId: auth.orgId,
          projectId: auth.projectId,
          provider,
          model: body?.model || "unknown",
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          region: auth.orgRegion,
          status: "failed"
        });
      }
    }

    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error("Google Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, "GET");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, "POST");
}
