import { auth as firebaseAuth, db } from "@/lib/firebase"; // Note: this is client sdk, but we can't use admin sdk easily without service account
import { encrypt } from "@/lib/encryption";
import { doc, setDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    const q = query(
      collection(db, "providerKeys"),
      where("orgId", "==", orgId)
    );

    const snapshot = await getDocs(q);
    const keys = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        provider: data.provider,
        nickname: data.nickname,
        createdAt: data.createdAt
      };
    }).sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    return NextResponse.json(keys);
  } catch (error: any) {
    console.error("Error fetching provider keys:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
