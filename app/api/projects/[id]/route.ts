import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    if (body.archived === undefined) {
      return NextResponse.json({ error: "Missing archived status" }, { status: 400 });
    }

    const projectRef = doc(db, "projects", id);
    await updateDoc(projectRef, {
      archived: body.archived,
      updatedAt: new Date(),
    });

    // Revoke associated EcoTrack keys if archived (SRS FR-41)
    if (body.archived) {
      const keysRef = collection(db, "ecoKeys");
      const q = query(keysRef, where("projectId", "==", id));
      const querySnap = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnap.docs.forEach(d => {
        batch.update(d.ref, { revoked: true });
      });
      await batch.commit();
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Project update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // 1. Delete associated EcoTrack keys
    const keysRef = collection(db, "ecoKeys");
    const q = query(keysRef, where("projectId", "==", id));
    const querySnap = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnap.docs.forEach(d => {
      batch.delete(d.ref);
    });

    // 2. Delete the project document
    const projectRef = doc(db, "projects", id);
    batch.delete(projectRef);

    await batch.commit();

    return NextResponse.json({ success: true, message: "Project and associated keys deleted" });
  } catch (error: any) {
    console.error("Project deletion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
