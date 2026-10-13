# Architecture Decision Records (ADRs)
## Badhon (NWU Blood Connect)
**Platform Name:** Badhon (বাঁধন) — NWU Blood Connect  
**Document Version:** 1.0.0  
**Phase:** Phase 1 — Requirements and Architecture  
**Date:** October 2026  

---

## ADR-001: Monorepo Architecture vs. Polyrepo
- **Status:** Accepted
- **Context:** Badhon involves a Flutter Android app, a Next.js public website, a Next.js admin dashboard, TypeScript Cloud Functions, and shared domain models. Maintaining separate repositories would create code drift, duplicate type definitions, and complex cross-repo PR workflows.
- **Decision:** Adopt a single repository (monorepo) using npm/pnpm workspaces. Flutter resides in `apps/mobile/`, Next.js apps in `apps/web/` and `apps/admin/`, backend in `functions/`, and shared types in `packages/`.
- **Consequences:** Single source of truth; synchronized changes across API contracts and frontends; simplified CI/CD tooling.

---

## ADR-002: Dual-Document Firestore Partitioning (Public vs. Private)
- **Status:** Accepted
- **Context:** Firestore security rules operate at the document level; rules cannot omit or mask specific fields from a document read query. Storing private phone numbers in the same document as public donor cards would either leak phone numbers or require blocking all public reads.
- **Decision:** Strictly partition data into separate collections: `donorPublic/{uid}` (sanitized, public read) and `donorPrivate/{uid}` (private, owner-only read). Synchronize public projections via automated Cloud Functions triggers. Apply the same pattern to `bloodRequests/{id}` and `requestPublic/{id}`.
- **Consequences:** Eliminates any possibility of accidental contact leaks in public queries. Adds minor eventual consistency delay (~1.5s) on profile updates, which is fully acceptable for a directory.

---

## ADR-003: Server-Mediated Contact Sharing via `getAuthorizedContact`
- **Status:** Accepted
- **Context:** In emergency situations, requesters need direct phone contact with accepted donors. However, public or client-directed contact reads create massive privacy risks, scraping vulnerability, and unwanted harassment.
- **Decision:** Contact numbers are never readable directly by client Firestore SDKs. Requesters must call the HTTPS Callable Cloud Function `getAuthorizedContact(requestId, donorUid)`. The function verifies on the server that:
  1. The caller is the authentic requester.
  2. The donor accepted that specific request.
  3. The request is not cancelled, expired, or fulfilled.
  4. An active, unrevoked `contactGrants` document exists.
- **Consequences:** Zero direct database access to contact data; complete server audit trail; instantaneous access revocation when requests complete or cancel.

---

## ADR-004: Firebase Auth Custom Claims for RBAC over Profile Fields
- **Status:** Accepted
- **Context:** Storing role indicators (e.g., `role: "admin"`) inside a Firestore user document allows potential privilege escalation if security rules have field-validation flaws or during client-side state manipulation.
- **Decision:** Enforce administrative privileges strictly through cryptographically signed Firebase Authentication Custom Claims (`admin: true`, `superAdmin: true`). Custom claims are set exclusively by trusted server-side Admin SDK scripts, never by client writes.
- **Consequences:** Tamper-proof role-based access control; rules check `request.auth.token.admin == true` with zero database read cost.

---

## ADR-005: Deterministic Document IDs for Concurrency & Idempotency
- **Status:** Accepted
- **Context:** In mobile network conditions common in Bangladesh, users may tap buttons repeatedly, or network retries may resubmit requests, potentially creating duplicate responses or invalid grant records.
- **Decision:** Generate deterministic document IDs for relational state:
  - Donor responses: `resp_${requestId}_${donorUid}`
  - Contact grants: `grant_${requestId}_${donorUid}`
- **Consequences:** Subsequent writes collide idempotently; impossible for one donor to register multiple concurrent accept responses for the same blood request.

---

## ADR-006: Separation of Public Website and Admin Portal into Distinct Applications
- **Status:** Accepted
- **Context:** Combining the public community portal and the administrative moderation dashboard into one Next.js app increases bundle size, complicates route middleware, and increases the attack surface for public users.
- **Decision:** Deploy two separate Next.js applications:
  1. `apps/web`: Public community website, sanitized donor directory, SEO landing page.
  2. `apps/admin`: Dedicated administrative portal with separate Firebase App Check and strict custom-claim route gating.
- **Consequences:** Clear security boundary; independent deployment cycles; zero admin UI code leaked to public web bundles.

---

## ADR-007: Administrative Location Hierarchy over Continuous GPS Tracking
- **Status:** Accepted
- **Context:** While GPS radius queries allow fine-grained matching, continuous background location tracking severely drains mobile battery, requires invasive OS permissions, and raises severe privacy concerns among student donors.
- **Decision:** Structure geographic matching around Bangladesh's standard administrative hierarchy: **Division $\rightarrow$ District $\rightarrow$ Upazila / Thana** (supplemented by landmark tags for Khulna city, such as "KMCH", "Boyra", "Sonadanga", "Shibbari").
- **Consequences:** High donor trust; zero battery drain; highly accurate matching for regional hospitals without tracking exact coordinates.

---

## ADR-008: Phone Normalization & Account Linking via Firebase Phone Auth
- **Status:** Accepted
- **Context:** Users register via Google Sign-In, but emergency coordination requires a verified Bangladeshi mobile number. Using standalone Phone Auth could create fragmented accounts if users log in with different methods.
- **Decision:** Require Google Sign-In as primary identity, then use `currentUser.linkWithCredential(phoneAuthCredential)` to attach verified phone identity. All phone numbers are validated and stored in standard E.164 format (`+8801XXXXXXXXX`).
- **Consequences:** Unified account identity; prevention of account duplication; validated phone verification status stored in `users/{uid}`.

---

## ADR-009: 90-Day Medical Donation Cooldown Working Default
- **Status:** Accepted
- **Context:** While Badhon is a coordination tool, not a medical authority, prompting donors who gave blood last week is both medically inappropriate and harms donor retention.
- **Decision:** Establish a safe, conservative default cooldown period of 90 days (3 months) following any logged donation before a donor is included in new matching notifications. App includes an explicit disclaimer that medical professionals verify vitals on site.
- **Consequences:** Protects donor health; prevents notification fatigue; transparent eligibility progress ring displayed in the app.

---

## ADR-010: Zero-PII Push Notification Payloads
- **Status:** Accepted
- **Context:** Push notifications travel through Google FCM infrastructure and OS notification trays, visible on device lockscreens.
- **Decision:** FCM payloads contain strictly non-sensitive tokens (`requestId`, `bloodGroup`, `hospitalName`, `district`, `urgency`). Phone numbers, patient names, and medical details are strictly banned from notification payloads.
- **Consequences:** Complies with privacy-by-design standards; immune to lockscreen snooping or push payload interception.
