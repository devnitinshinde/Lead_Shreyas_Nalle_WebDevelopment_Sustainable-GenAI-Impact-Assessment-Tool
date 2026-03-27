import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Missing key id" }, { status: 400 });
    }

    const keyRef = doc(db, "ecoKeys", id);
    await updateDoc(keyRef, {
      revoked: true
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error revoking eco key:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
