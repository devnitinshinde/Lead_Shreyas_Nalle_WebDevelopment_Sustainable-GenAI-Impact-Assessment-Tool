import { db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
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

    const keyRef = doc(db, "providerKeys", id);
    await deleteDoc(keyRef);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting provider key:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
