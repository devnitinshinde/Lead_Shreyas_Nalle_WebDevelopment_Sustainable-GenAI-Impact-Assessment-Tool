import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";

export interface LogRequestParams {
  orgId: string;
  projectId: string | null;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  region: string;
  status: "success" | "failed";
}

export async function logProxyMetrics(params: LogRequestParams) {
  try {
    // 1. Get Model Efficiency (Wh/1k tokens)
    const modelRegistryRef = collection(db, "modelRegistry");
    const mq = query(modelRegistryRef, where("modelName", "==", params.model), limit(1));
    const modelSnap = await getDocs(mq);
    
    let whPer1k = 2.5; // Default fallback (e.g. gpt-3.5-turbo level)
    if (!modelSnap.empty) {
      whPer1k = modelSnap.docs[0].data().whPer1kTokens || 2.5;
    }

    // 2. Get Regional Carbon Intensity
    const intensityRef = collection(db, "regionCarbonIntensity");
    const iq = query(intensityRef, where("regionCode", "==", params.region.toLowerCase()), limit(1));
    const intensitySnap = await getDocs(iq);
    
    let gco2PerWh = 0.45; // Global average fallback
    if (!intensitySnap.empty) {
      gco2PerWh = intensitySnap.docs[0].data().gco2PerWh || 0.45;
    }

    // 3. Calculate Metrics (SRS FR-27)
    const energyWh = (params.totalTokens / 1000) * whPer1k;
    const co2Grams = energyWh * gco2PerWh;

    // 4. Log to callLogs (SRS FR-26)
    await addDoc(collection(db, "callLogs"), {
      ...params,
      energyWh: Number(energyWh.toFixed(4)),
      co2Grams: Number(co2Grams.toFixed(4)),
      createdAt: serverTimestamp()
    });

  } catch (error) {
    console.error("Failed to log proxy metrics:", error);
  }
}
