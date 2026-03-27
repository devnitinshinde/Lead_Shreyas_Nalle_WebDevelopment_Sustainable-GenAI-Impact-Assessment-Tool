import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    const q = query(
      collection(db, "ecoKeys"),
      where("orgId", "==", orgId)
    );

    const snapshot = await getDocs(q);
    const keys = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    // Remove sensitive fields just in case (though keyHash should not be returned)
    const safeKeys = keys.map(({ keyHash, ...rest }: any) => rest);

    return NextResponse.json(safeKeys);
  } catch (error: any) {
    console.error("Error fetching eco keys:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
