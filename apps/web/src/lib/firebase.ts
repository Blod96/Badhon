import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, Functions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyPlaceholderKeyForDevelopmentOnly",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-badhon-local.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-badhon-local",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-badhon-local.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789000:web:abcdef123456"
};

// Singleton initialization
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const functions: Functions = getFunctions(app, "asia-south1");

// Connect to local emulators if configured
if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "1"
) {
  const authHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || "localhost:9099";
  const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || "localhost:8080";
  const functionsHost = process.env.NEXT_PUBLIC_FUNCTIONS_EMULATOR_HOST || "localhost:5001";

  // Prevent multiple connections during hot-reloads
  const globalAny = window as any;
  if (!globalAny.__FIREBASE_EMULATORS_CONNECTED__) {
    try {
      connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
      const [fsHost, fsPort] = firestoreHost.split(":");
      connectFirestoreEmulator(db, fsHost, parseInt(fsPort, 10));
      const [fnHost, fnPort] = functionsHost.split(":");
      connectFunctionsEmulator(functions, fnHost, parseInt(fnPort, 10));
      globalAny.__FIREBASE_EMULATORS_CONNECTED__ = true;
      console.log("[Firebase] Connected to local Emulators (Auth, Firestore, Functions)");
    } catch (err) {
      console.warn("[Firebase] Emulator connection warning:", err);
    }
  }
}

export { app, auth, db, functions };
