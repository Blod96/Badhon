# Production Operations Runbook & Incident Response
## Badhon (বাঁধন) — NWU Blood Connect

**Version:** 1.0.0  
**Target:** Production Operations & Support  
**Region:** `asia-south1` (Mumbai) / `asia-southeast1` (Singapore)  

---

## 1. Daily Operations & Routine Maintenance

### 1.1 Automated Backups
Cloud Firestore backups are taken daily at 02:00 UTC using Cloud Scheduler + Cloud Storage:
```bash
# Manual export trigger if needed before major database changes:
gcloud firestore export gs://badhon-nwu-prod-backups/manual-$(date +%Y%m%d_%H%M%S) --project badhon-nwu-blood-connect
```

### 1.2 Automated Request Expiry Maintenance
- Cloud Function `cleanupExpiredRequests` runs automatically via Cloud Scheduler every 15 minutes (`*/15 * * * *`).
- Verifies that expired blood requests transition to `EXPIRED` status and their associated `contactGrants` are invalidated.

---

## 2. Emergency Incident Response Protocols

### 2.1 Scenario: Suspected Donor Phone Number Leak / Scraping
1. **Immediate Quarantine:**
   - Execute admin moderation function:
     ```bash
     # Suspend suspected user immediately
     npx tsx scripts/admin-action.ts --action suspend --userId <suspicious_uid> --reason "Suspicious rapid contact querying"
     ```
2. **Audit Inspection:**
   - Check `contactAccessAuditLogs` in Firestore or Admin Portal at `/audit` to verify which accounts accessed the phone numbers and IP addresses.
3. **Emergency Lockdown (Worst Case):**
   - If a vulnerability in rules is identified, deploy emergency default-deny to Firestore:
     ```bash
     firebase deploy --only firestore:rules
     ```

### 2.2 Scenario: Blood Request Spamming
- Rate limits are built-in (max 3 active requests per user, cooldown enforced).
- Administrators can use the Admin Portal (`apps/admin`) to cancel spam requests with single-click moderation.

---

## 3. Deployment Rollback Procedures

### 3.1 Web & Admin Portals (Firebase Hosting)
Firebase Hosting stores all previous deployment versions. To roll back instantly:
1. Open Firebase Console > Hosting > Release History.
2. Click **Rollback** to the desired previous version.
3. Or via CLI:
   ```bash
   firebase hosting:clone badhon-nwu-web:<previous-version-id> badhon-nwu-web:live
   ```

### 3.2 Cloud Functions Rollback
To redeploy the previous known-good commit:
```bash
git checkout <last-stable-commit-hash>
pnpm --filter "badhon-functions" build
firebase deploy --only functions
```

---

## 4. Contact Escalation Matrix
- **Lead System Architect:** Computer Science & Engineering Dept, NWU
- **Primary Technical Admin:** `admin@nwu.edu.bd`
- **Hosting / Cloud Provider:** Google Cloud Platform & Firebase Support
