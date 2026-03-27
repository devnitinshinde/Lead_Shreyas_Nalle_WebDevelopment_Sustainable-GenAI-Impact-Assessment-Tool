import { db } from "./firebase";
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore";
import { compareValue } from "./bcrypt";
import { decrypt } from "./encryption";

export interface ProxyAuthResult {
  orgId: string;
  projectId: string | null;
  orgRegion: string;
  providerKey: string;
}

export async function validateProxyRequest(request: Request, provider: string): Promise<ProxyAuthResult> {
  const authHeader = request.headers.get("Authorization");
  const headerProjectId = request.headers.get("EcoTrack-Project-Id");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const fullKey = authHeader.split(" ")[1];
  if (!fullKey) throw new Error("Invalid API key format");

  const keyPrefix = fullKey.substring(0, 12);

  // 1. Find the EcoTrack API key doc
  const ecoKeysRef = collection(db, "ecoKeys");
  const q = query(ecoKeysRef, where("keyPrefix", "==", keyPrefix), limit(1));
  const querySnap = await getDocs(q);

  if (querySnap.empty) {
    throw new Error("Invalid EcoTrack API key (Prefix mismatch)");
  }

  const ecoKeyDoc = querySnap.docs[0];
  const ecoKeyData = ecoKeyDoc.data();

  if (ecoKeyData.revoked) {
    throw new Error("EcoTrack API key has been revoked");
  }

  // 2. Validate hash
  const isValid = await compareValue(fullKey, ecoKeyData.keyHash);
  if (!isValid) {
    throw new Error("Invalid EcoTrack API key (Hash mismatch)");
  }

  const orgId = ecoKeyData.orgId;
  
  // 3. Project ID Logic (SRS Enhancement)
  // Priority: 1. Header Override, 2. Key Scoping
  let projectId = headerProjectId || ecoKeyData.projectId || null;

  // 4. Get Organization Region
  const orgRef = doc(db, "users", orgId);
  const orgSnap = await getDoc(orgRef);
  
  if (!orgSnap.exists()) {
    throw new Error("Associated organization not found");
  }

  const orgData = orgSnap.data();
  const orgRegion = orgData.countryRegion || "global";

  // 5. Get and Decrypt Provider Key
  const providerKeysRef = collection(db, "providerKeys");
  const pq = query(
    providerKeysRef, 
    where("orgId", "==", orgId), 
    where("provider", "==", provider),
    limit(1)
  );
  const providerSnap = await getDocs(pq);

  if (providerSnap.empty) {
    throw new Error(`No provider key configured for: ${provider}`);
  }

  const pkData = providerSnap.docs[0].data();
  const decryptedKey = decrypt(pkData.encryptedKey, pkData.iv, pkData.authTag);

  return {
    orgId,
    projectId,
    orgRegion,
    providerKey: decryptedKey
  };
}
