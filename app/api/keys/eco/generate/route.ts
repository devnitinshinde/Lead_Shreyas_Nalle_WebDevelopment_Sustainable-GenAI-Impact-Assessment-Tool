import { db } from "@/lib/firebase";
import { hashValue } from "@/lib/bcrypt";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { orgId, name } = await request.json();

    if (!orgId || !name) {
      return NextResponse.json({ error: "Missing orgId or name" }, { status: 400 });
    }

    // Generate unique EcoTrack API key
    // Format: eco-sk-{orgId first 8 chars}-{32 random hex chars}
    const randomHex = crypto.randomBytes(16).toString("hex"); // 32 hex chars
    const fullKey = `eco-sk-${orgId.substring(0, 8)}-${randomHex}`;
    
    // Hash the full key
    const keyHash = await hashValue(fullKey);
    // First 12 chars as prefix
    const keyPrefix = fullKey.substring(0, 12);

    // Save to Firestore ecoKeys collection
    const keyData = {
      orgId,
      projectId: null, // global key
      keyHash,
      keyPrefix,
      name,
      revoked: false,
      createdAt: serverTimestamp(),
      lastUsedAt: null,
    };

    const keyRef = doc(collection(db, "ecoKeys"));
    await setDoc(keyRef, keyData);

    // Return the full key ONLY ONCE
    return NextResponse.json({ success: true, fullKey, id: keyRef.id });
  } catch (error: any) {
    console.error("Eco key generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
