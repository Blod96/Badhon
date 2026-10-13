# Deployment & Environment Operations Guide
## Badhon (NWU Blood Connect)
**Platform Name:** Badhon (বাঁধন) — NWU Blood Connect  
**Document Version:** 1.0.0  
**Phase:** Phase 1 — Requirements and Architecture  
**Date:** October 2026  

---

## 1. Environment Topology

Badhon operates across three segregated environments to guarantee that testing, staging, and production workloads remain strictly isolated:

| Environment | Firebase Project ID | Purpose | Ingress URLs / App IDs |
| :--- | :--- | :--- | :--- |
| **Local Emulator** | `demo-badhon-local` | Offline development, automated security rules testing | `localhost:4000` (Emulator UI), `localhost:8080` (Firestore) |
| **Staging / Dev** | `badhon-nwu-staging` | Pre-release integration, QA testing, synthetic data review | `staging.badhon-nwu.web.app`<br>`bd.edu.nwu.badhon.dev` |
| **Production** | `badhon-nwu-prod` | Live production operations for NWU community | `badhon.nwu.edu.bd` (Custom Domain)<br>`admin.badhon.nwu.edu.bd`<br>`bd.edu.nwu.badhon` |

> [!CAUTION]
> **No Automatic Cloud Resource Creation:** In accordance with project governance, no real cloud projects, service accounts, or production resources may be provisioned without explicit, documented user authorization.

---

## 2. Secrets Management & Environment Configuration

### 2.1 Git Exclusion Policy
All environment variables containing API keys, private credentials, and client configurations are excluded from version control:
- `.env`, `.env.local`, `.env.production` are strictly tracked in `.gitignore`.
- Only sanitized `.env.example` templates with empty placeholders are committed.

### 2.2 Cloud Functions Secrets (Google Cloud Secret Manager)
Sensitive server-side credentials (such as FCM service credentials, external SMS gateways, or private tokens) are mounted directly via Firebase Cloud Functions Secret Manager:
```bash
firebase functions:secrets:set SMS_GATEWAY_API_KEY
```
In code, secrets are declared and accessed securely:
```typescript
import { defineSecret } from "firebase-functions/params";
const smsApiKey = defineSecret("SMS_GATEWAY_API_KEY");
```

---

## 3. Super Admin Bootstrap Procedure

To prevent hardcoded default administrator credentials in source code, the initial Super Admin account is provisioned via an offline CLI script executing the Firebase Admin SDK:

### Step-by-Step Bootstrap Instructions:
1. Obtain an authorized service account key from the Google Cloud Console for the target project.
2. Store the key temporarily in a secure local path outside source control (e.g., `~/credentials/badhon-service-account.json`).
3. Execute the dedicated bootstrap script locally:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=~/credentials/badhon-service-account.json \
   npx ts-node scripts/bootstrap-superadmin.ts --email "admin@nwu.edu.bd"
   ```
4. The script:
   - Locates the user's Firebase Auth record by email.
   - Sets custom user claims: `{ admin: true, superAdmin: true }`.
   - Records an immutable initialization entry in `adminAuditLogs`.
   - Revokes existing refresh tokens to force immediate token renewal.
5. Securely delete the local service account key after completion.

---

## 4. Frontend & Cloud Deployment Pipelines

### 4.1 TypeScript Cloud Functions Deployment
- **Region:** `asia-south1` (Mumbai) or `asia-southeast1` (Singapore) for optimal latency from Bangladesh.
- **Runtime:** Node.js 20 with TypeScript compile step.
- **Command:**
  ```bash
  npm --prefix functions run build
  firebase deploy --only functions --project <project-id>
  ```

### 4.2 Web Portal & Admin Dashboard (Firebase Hosting)
Both Next.js applications are configured for deployment to Firebase Hosting using multi-site hosting targets:
```json
{
  "hosting": [
    {
      "target": "web-public",
      "public": "apps/web/out",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    },
    {
      "target": "admin-portal",
      "public": "apps/admin/out",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    }
  ]
}
```
Deployment command:
```bash
firebase deploy --only hosting --project <project-id>
```

---

## 5. Android Mobile Build & Signing Strategy

### 5.1 Package Configuration
- **Application ID:** `bd.edu.nwu.badhon` (Production) / `bd.edu.nwu.badhon.dev` (Staging).
- **Target SDK:** Android 14 (API level 34).
- **Min SDK:** Android 6.0 (API level 23) to maximize device accessibility across older smartphones in Bangladesh.

### 5.2 Release Keystore Generation Guidelines
Production signing keystores are generated using standard Java Keytool and kept out of Git:
```bash
keytool -genkey -v -keystore badhon-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias badhon_release
```
Keystore credentials are provided via local `key.properties` during release builds:
```bash
flutter build appbundle --release --flavor production
```

---

## 6. Observability, Logging & Disaster Recovery

1. **Structured Cloud Logging:** Cloud Functions emit structured JSON logs to Google Cloud Logging. PII scrubbers redact phone numbers and auth headers prior to log ingestion.
2. **Alerting Policies:** Automated email and Slack/Discord alerts for:
   - Elevated Cloud Function error rates (>1% of invocations).
   - Firestore write quota threshold (>80%).
   - Failed FCM multicast dispatch rates (>5%).
3. **Database Backup Strategy:** Automated daily Cloud Firestore managed exports to Cloud Storage with 30-day retention:
   ```bash
   gcloud firestore export gs://badhon-nwu-backups/daily-$(date +%Y%m%d)
   ```
4. **Rollback Protocol:** In the event of a breaking regression, Firebase Hosting and Cloud Functions can be instantly rolled back to the prior deployed revision using the Firebase Console or `firebase hosting:clone`.
