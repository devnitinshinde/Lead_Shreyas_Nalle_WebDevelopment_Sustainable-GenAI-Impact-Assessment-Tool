import { db } from "@/lib/firebase";
import { hashValue } from "@/lib/bcrypt";
import { encrypt } from "@/lib/encryption";
import { doc, setDoc, collection, serverTimestamp, query, where, getDocs, orderBy, writeBatch } from "firebase/firestore";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    // 1. Fetch projects (Simplified to avoid index requirement)
    const projectsQuery = query(
      collection(db, "projects"),
      where("orgId", "==", orgId)
    );
    const projectsSnap = await getDocs(projectsQuery);
    const projects = projectsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((p: any) => p.archived !== true)
      .sort((a: any, b: any) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

    // 2. Fetch stats from callLogs for each project
    const projectsWithStats = await Promise.all(projects.map(async (project: any) => {
      const logsQuery = query(
        collection(db, "callLogs"),
        where("projectId", "==", project.id)
      );
      const logsSnap = await getDocs(logsQuery);
      
      let totalCalls = 0;
      let totalEnergyWh = 0;
      let totalCo2Grams = 0;

      logsSnap.forEach(doc => {
        const data = doc.data();
        totalCalls += 1;
        totalEnergyWh += data.energyWh || 0;
        totalCo2Grams += data.co2Grams || 0;
      });

      return {
        ...project,
        stats: {
          totalCalls,
          totalEnergyKwh: Number((totalEnergyWh / 1000).toFixed(2)),
          totalCo2Kg: Number((totalCo2Grams / 1000).toFixed(2)),
        }
      };
    }));

    return NextResponse.json(projectsWithStats);
  } catch (error: any) {
    console.error("Projects fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgId, projectName, description, environment, selectedModels, newProviderKeys } = body;

    if (!orgId || !projectName || !environment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const batch = writeBatch(db);

    // 1. Handle New Provider Keys (Encryption & Storage)
    if (newProviderKeys && typeof newProviderKeys === 'object') {
      for (const [provider, key] of Object.entries(newProviderKeys)) {
        if (key && typeof key === 'string') {
          const encrypted = encrypt(key);
          const pkRef = doc(collection(db, "providerKeys"));
          batch.set(pkRef, {
            orgId,
            provider,
            nickname: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Key (Auto-added)`,
            encryptedKey: encrypted.encryptedKey,
            iv: encrypted.iv,
            authTag: encrypted.authTag,
            createdAt: serverTimestamp(),
          });
        }
      }
    }

    // 2. Create project document
    const projectRef = doc(collection(db, "projects"));
    const projectData = {
      orgId,
      name: projectName,
      description: description || "",
      environment,
      selectedModels: selectedModels || [],
      archived: false,
      createdAt: serverTimestamp(),
    };
    batch.set(projectRef, projectData);

    // 3. Generate project-scoped EcoTrack API key
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
    batch.set(keyRef, keyData);

    await batch.commit();

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
