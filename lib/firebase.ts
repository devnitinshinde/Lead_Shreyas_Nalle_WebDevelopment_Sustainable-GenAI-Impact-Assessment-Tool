import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyApEk1EeLPTHbWHs9NwDnryP88p88WnZQ4",
  authDomain: "ecotrack-67a7f.firebaseapp.com",
  projectId: "ecotrack-67a7f",
  storageBucket: "ecotrack-67a7f.firebasestorage.app",
  messagingSenderId: "574861242396",
  appId: "1:574861242396:web:0b4ce22d8907bbe8a36fd9",
  measurementId: "G-SEM9WEJPQY"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics conditionally (only in browser)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, analytics };
