import { auth as firebaseAuth, db } from "@/lib/firebase"; // Note: this is client sdk, but we can't use admin sdk easily without service account
import { encrypt } from "@/lib/encryption";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { provider, apiKey, nickname, orgId } = await request.json();

    if (!provider || !apiKey || !nickname || !orgId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Encrypt the key
    const encrypted = encrypt(apiKey);

    // Save to Firestore providerKeys collection
    const keyData = {
      orgId,
      provider,
      ...encrypted,
      nickname,
      createdAt: serverTimestamp(),
    };

    const keyRef = doc(collection(db, "providerKeys"));
    await setDoc(keyRef, keyData);

    return NextResponse.json({ success: true, id: keyRef.id });
  } catch (error: any) {
    console.error("Provider key save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
