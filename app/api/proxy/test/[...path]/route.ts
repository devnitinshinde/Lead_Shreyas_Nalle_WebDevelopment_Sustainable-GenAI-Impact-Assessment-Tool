import { NextResponse } from "next/server";
import { logProxyMetrics } from "@/lib/metrics";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore";
import { compareValue } from "@/lib/bcrypt";

/**
 * EcoTrack Mock/Test Provider
 * Free, zero-cost endpoint that simulates real AI responses.
 * Logs real sustainability metrics to Firestore using the authenticated user's real orgId.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    await params; // consume params

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }

    const fullKey = authHeader.split(" ")[1];
    const keyPrefix = fullKey.substring(0, 12);
    const headerProjectId = request.headers.get("EcoTrack-Project-Id");

    // Resolve orgId from the EcoTrack key (so logs appear for the real user)
    let orgId = "";
    let projectId: string | null = headerProjectId;
    let orgRegion = "global";

    const keysSnap = await getDocs(query(
      collection(db, "ecoKeys"),
      where("keyPrefix", "==", keyPrefix),
      limit(1)
    ));

    if (!keysSnap.empty) {
      const keyData = keysSnap.docs[0].data();
      const isValid = await compareValue(fullKey, keyData.keyHash);
      if (!isValid || keyData.revoked) {
        return NextResponse.json({ error: "Invalid or revoked EcoTrack API key" }, { status: 401 });
      }
      orgId = keyData.orgId;
      if (!projectId) projectId = keyData.projectId || null;

      // Get region from org user profile
      const orgSnap = await getDoc(doc(db, "users", orgId));
      if (orgSnap.exists()) orgRegion = orgSnap.data().countryRegion || "global";
    } else {
      return NextResponse.json({ error: "EcoTrack API key not found" }, { status: 401 });
    }

    const body = await request.json();
    const userMessage = body?.messages?.find((m: any) => m.role === "user")?.content || "Hello";
    const model = body?.model || "eco-test-gpt";
    const promptTokens = Math.max(1, Math.floor(userMessage.split(" ").length * 1.3));
    const completionTokens = Math.floor(Math.random() * 80) + 40;
    const totalTokens = promptTokens + completionTokens;

    // Simulate latency
    await new Promise(r => setTimeout(r, 100 + Math.random() * 200));

    // Log REAL metrics against the real orgId/projectId
    logProxyMetrics({
      orgId,
      projectId,
      provider: "test",
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      region: orgRegion,
      status: "success"
    });

    return NextResponse.json({
      id: `chatcmpl-eco-test-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: generateMockResponse(userMessage),
        },
        finish_reason: "stop"
      }],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
      },
      ecotrack: {
        provider: "test",
        org_id: orgId,
        tracked_project_id: projectId,
        mode: "simulation"
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Test Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateMockResponse(input: string): string {
  const responses = [
    `[EcoTrack Test] I received: "${input.substring(0, 60)}...". This is a simulated response — no AI API cost incurred. Your sustainability telemetry has been logged to your project dashboard!`,
    `[Simulation] EcoTrack proxy engine successfully intercepted this request. Energy and CO2 metrics are now visible in your dashboard and project analytics.`,
    `[Mock Response] Your query was routed through EcoTrack's proxy engine. In production, this call would be forwarded to your configured AI provider. The sustainability data (Wh/gCO2) is recorded.`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
