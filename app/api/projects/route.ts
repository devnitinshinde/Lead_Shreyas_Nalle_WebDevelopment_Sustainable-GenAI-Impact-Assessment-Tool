import { db } from "@/lib/firebase";
import { hashValue } from "@/lib/bcrypt";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { orgId, projectName, description, environment } = await request.json();

    if (!orgId || !projectName || !environment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create project document
    const projectRef = doc(collection(db, "projects"));
    const projectData = {
      orgId,
      name: projectName,
      description: description || "",
      environment,
      archived: false,
      createdAt: serverTimestamp(),
    };
    await setDoc(projectRef, projectData);

    // 2. Generate project-scoped EcoTrack API key
    const randomHex = crypto.randomBytes(16).toString("hex");
    const fullKey = `eco-sk-${orgId.substring(0, 8)}-${randomHex}`;
    const keyHash = await hashValue(fullKey);
    const keyPrefix = fullKey.substring(0, 12);

    const keyRef = doc(collection(db, "ecoKeys"));
    const keyData = {
      orgId,
      projectId: projectRef.id,
      keyHash,
      keyPrefix,
      name: `Project: ${projectName}`,
      revoked: false,
      createdAt: serverTimestamp(),
      lastUsedAt: null,
    };
    await setDoc(keyRef, keyData);

    return NextResponse.json({ 
      success: true, 
      projectId: projectRef.id, 
      projectName, 
      fullKey,
      keyId: keyRef.id 
    });
  } catch (error: any) {
    console.error("Project creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
