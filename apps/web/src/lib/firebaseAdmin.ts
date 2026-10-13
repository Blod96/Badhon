import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getMessaging, type Messaging } from "firebase-admin/messaging";
import * as fs from "fs";
import * as path from "path";

function getAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  // 1. Try environment variable (JSON string for Vercel)
  const envServiceKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envServiceKey) {
    try {
      const parsed = JSON.parse(envServiceKey);
      return initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || "badhon-483e1"
      });
    } catch (e) {
      console.warn("[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY env:", e);
    }
  }

  // 2. Try individual environment variables
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "badhon-483e1",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "badhon-483e1"
    });
  }

  // 3. Try local file path (credentials/service-account.json)
  const localPaths = [
    path.resolve(process.cwd(), "credentials/service-account.json"),
    path.resolve(process.cwd(), "../../credentials/service-account.json"),
    path.resolve(process.cwd(), "../credentials/service-account.json"),
  ];

  for (const p of localPaths) {
    if (fs.existsSync(p)) {
      try {
        const fileContent = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(fileContent);
        if (parsed.private_key) {
          return initializeApp({
            credential: cert(parsed),
            projectId: parsed.project_id || "badhon-483e1"
          });
        }
      } catch (e) {
        console.warn("[FirebaseAdmin] Failed reading credential file at:", p, e);
      }
    }
  }

  // Fallback default app (uses Application Default Credentials if available)
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "badhon-483e1"
  });
}

export const adminApp: App = getAdminApp();
export const adminDb: Firestore = getFirestore(adminApp);
export const adminMessaging: Messaging = getMessaging(adminApp);
