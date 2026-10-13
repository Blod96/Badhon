# Phase-by-Phase Implementation Roadmap
## Badhon (NWU Blood Connect)
**Platform Name:** Badhon (বাঁধন) — NWU Blood Connect  
**Document Version:** 1.0.0  
**Phase:** Phase 1 — Requirements and Architecture  
**Date:** October 2026  

---

## 1. Project Implementation Strategy

To deliver a reliable, secure, and production-ready platform, development strictly adheres to a sequential 10-phase lifecycle. Each phase defines explicit deliverables, automated verification checks, and acceptance criteria. 

> [!IMPORTANT]
> **Strict Phase Gates:** No phase may be started until the preceding phase is completed, its verification checks pass, results are documented, and the user provides explicit authorization to proceed.

---

## 2. Phase Breakdown & Acceptance Criteria

### Phase 1: Requirements and Architecture (CURRENT PHASE)
- **Scope:** Complete foundational architecture, domain modeling, security specifications, API contracts, screen maps, and test plans.
- **Deliverables:**
  - `docs/PRD.md`
  - `docs/ARCHITECTURE.md`
  - `docs/DATABASE_SCHEMA.md`
  - `docs/SECURITY_MODEL.md`
  - `docs/API_CONTRACTS.md`
  - `docs/UI_SCREEN_MAP.md`
  - `docs/TEST_STRATEGY.md`
  - `docs/DEPLOYMENT.md`
  - `docs/DECISIONS.md`
  - `docs/PHASES.md`
- **Verification Checks:** Markdown syntax validation, cross-document consistency checks, documentation of unresolved policy questions and safe defaults.
- **Acceptance Criteria:** All 10 documents created, zero conflicting requirements, clear boundaries established.

---

### Phase 2: Workspace Foundation and UI/UX Scaffolding
- **Scope:** Initialize the monorepo workspace, setup dependencies, configure linting, establish design tokens, and build tactile responsive UI prototypes across Flutter, Web, and Admin.
- **Deliverables:**
  - Monorepo package manifests (`package.json`, pnpm/npm workspace).
  - Flutter Android app scaffold (`apps/mobile`) with theme, router, and core screen layouts.
  - Next.js public website scaffold (`apps/web`) with Tailwind CSS and responsive landing components.
  - Next.js admin dashboard scaffold (`apps/admin`) with data table primitives.
  - TypeScript Cloud Functions project scaffold (`functions`).
  - Shared domain models and Zod schemas (`packages/domain`, `packages/api-contracts`).
  - Labeled synthetic visual mockups for design review.
- **Verification Checks:** `npm run lint`, `flutter analyze`, Next.js build typechecks.
- **Acceptance Criteria:** Monorepo builds cleanly offline; all 25 mobile screens and web pages render responsive UI using synthetic mock data.

---

### Phase 3: Firebase Environment and Authentication
- **Scope:** Configure Firebase project setup, initialize SDKs, implement Google Sign-In, Phone Auth linking, session management, and onboarding profile creation.
- **Deliverables:**
  - Firebase client initialization in Flutter (`apps/mobile/lib/core/firebase`).
  - Firebase client initialization in Next.js (`apps/web/src/lib/firebase`).
  - Google Sign-In authentication workflows with session persistence.
  - Bangladeshi phone number validation and Firebase Phone Auth linking.
  - Onboarding role picker and profile creation Callable function (`registerUser`).
  - Custom claims bootstrap script (`scripts/bootstrap-superadmin.ts`).
- **Verification Checks:** Auth flow execution in Firebase Auth Emulator; token custom claims inspection test.
- **Acceptance Criteria:** User can sign in with Google, link verified phone, and complete onboarding profile; admin claims are verifiable in token.

---

### Phase 4: Database, Security Rules, and Donor Directory
- **Scope:** Deploy Firestore rules baseline, create database collections, implement public/private dual-document synchronization, and build the searchable donor directory.
- **Deliverables:**
  - `firebase/firestore.rules` (Default-deny baseline).
  - `firebase/firestore.indexes.json`.
  - Cloud Function trigger syncing `users`/`donorPrivate` to `donorPublic`.
  - Directory search and filter screens in Flutter and Next.js.
  - Comprehensive rules test suite (`firebase/firestore.rules.test.ts`).
- **Verification Checks:** 100% pass on Firestore Rules unit tests via Firebase Emulator Suite (`npm run test:rules`).
- **Acceptance Criteria:** Unauthorized cross-user reads on `donorPrivate` are blocked; public queries only return sanitized data for consented donors; pagination operates smoothly.

---

### Phase 5: Blood Requests and Lifecycle Management
- **Scope:** Implement emergency blood request creation, validation, status transitions, cancellation, fulfillment, and scheduled auto-expiry.
- **Deliverables:**
  - Callable function `createBloodRequest` with rate limiting and schema validation.
  - Callable function `updateBloodRequestStatus` (cancel/fulfill).
  - Scheduled function `cleanupExpiredRequests`.
  - Cloud Function trigger mirroring `bloodRequests` to `requestPublic`.
  - Requester UI for managing active requests and tracking fulfillment.
- **Verification Checks:** Integration tests verifying status transitions, expired request cleanup, and spam rate limiting.
- **Acceptance Criteria:** Requests transition through the state machine cleanly; expired requests auto-close; public request summaries stay in sync.

---

### Phase 6: Donor Matching and Notifications Engine
- **Scope:** Build the geographic and eligibility matching engine, FCM push notification dispatch pipeline, and in-app notification drawers.
- **Deliverables:**
  - Matching engine querying eligible candidate donors by blood group, location, and cooldown.
  - FCM multicast batch dispatcher (max 50 per batch) with privacy-safe payloads.
  - FCM device token registration and cleanup handlers (`registerDeviceToken`).
  - Mobile in-app notification center and priority match alert dialogue.
  - Donor accept/decline transaction workflow (`respondToRequest`).
- **Verification Checks:** Matching engine unit tests; FCM payload privacy audit; concurrency tests on multiple simultaneous donor accepts.
- **Acceptance Criteria:** Notifications dispatch idempotently; zero PII in push payloads; multiple concurrent accepts resolve safely without race conditions.

---

### Phase 7: Consent-Based Contact Sharing (CRITICAL SECURITY GATE)
- **Scope:** Implement the atomic `contactGrants` architecture and server-mediated `getAuthorizedContact` endpoint.
- **Deliverables:**
  - Atomic grant creation within `respondToRequest` transaction.
  - Callable function `getAuthorizedContact(requestId, donorUid)`.
  - Automatic grant revocation trigger on request cancellation, fulfillment, or expiry.
  - Authorized contact UI screen with direct call and WhatsApp coordination buttons.
  - Comprehensive security test suite verifying all access boundaries.
- **Verification Checks:** Security test verifying contact access is denied before acceptance, allowed post-acceptance, and denied post-revocation.
- **Acceptance Criteria:** **Release Blocker.** 100% of contact-sharing tests pass; zero contact leakage through direct database reads or unauthorized API calls.

---

### Phase 8: Admin Dashboard and Moderation Operations
- **Scope:** Build the protected administrative portal for user management, request moderation, abuse report resolution, and audit log inspection.
- **Deliverables:**
  - Next.js Admin portal with custom claim route middleware.
  - User and donor management views with pagination and suspension controls.
  - Request moderation view with force-close controls.
  - Abuse reports triage queue (`reports`).
  - Notification health monitoring dashboard.
  - Super Admin audit log explorer (`adminAuditLogs`).
- **Verification Checks:** Admin API authorization tests; route guard tests blocking non-admin users.
- **Acceptance Criteria:** Only authenticated administrators with valid custom claims can access admin endpoints; all privileged actions generate audit entries.

---

### Phase 9: Full Quality Assurance, Hardening & Security Audit
- **Scope:** End-to-end integration testing, accessibility audit, performance optimization, and disaster recovery validation.
- **Deliverables:**
  - Automated End-to-End simulation script executing complete user flows in emulator.
  - WCAG 2.1 AA accessibility audit (touch target sizing, color contrast ratios).
  - Firestore query performance review and index verification.
  - Data deletion and retention verification test.
  - Security vulnerability review and risk documentation report.
- **Verification Checks:** Full test suite execution (`npm run test:all`, `flutter test`); lighthouse accessibility score $\ge 95$.
- **Acceptance Criteria:** Zero critical vulnerabilities; all tests pass; verified offline capabilities and error boundaries.

---

### Phase 10: Deployment and Production Readiness Handover
- **Scope:** Staging environment deployment, build artifact generation, production release documentation, and operational handover.
- **Deliverables:**
  - Firebase Hosting multi-target deployment configuration.
  - Cloud Functions deployment to Google Cloud region `asia-south1`.
  - Android release APK/AAB build instructions and signing setup.
  - Production operations runbook and disaster recovery protocol.
  - Final project report and maintenance handover documentation.
- **Verification Checks:** Verification of staging deployments; automated smoke test execution against staging endpoints.
- **Acceptance Criteria:** Production-ready artifacts packaged; explicit user approval obtained before any public release.

---

## 3. Definition of Done (DoD) Checklist

A phase is officially marked **DONE** if and only if:
1. [x] All specified files and architectural modules for the phase are created.
2. [x] Code strictly adheres to design tokens, TypeScript types, and coding guidelines.
3. [x] All available linters, typecheckers, and test suites have been executed and pass.
4. [x] Any identified test failure or limitation is documented.
5. [x] Security boundaries applicable to the phase are tested and verified.
6. [x] No credentials, private user data, or API keys are committed to Git.
7. [x] Documentation accurately reflects the real implementation.
8. [x] A concise phase completion summary is delivered, including changed files and exact next steps.
9. [x] Explicit user confirmation is requested before initiating the subsequent phase.
