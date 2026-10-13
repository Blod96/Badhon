# Product Requirements Document (PRD)
## Badhon (NWU Blood Connect)
**Platform Name:** Badhon (বাঁধন) — NWU Blood Connect  
**Institution:** North Western University (NWU), Khulna, Bangladesh  
**Document Version:** 1.0.0  
**Phase:** Phase 1 — Requirements and Architecture  
**Date:** October 2026  

---

## 1. Executive Summary & Purpose

**Badhon (NWU Blood Connect)** is a dedicated university and community blood donation coordination platform created for North Western University (NWU), Bangladesh, and the broader community in the Khulna region.

In emergency medical situations, finding compatible blood donors quickly is often hindered by fragmented social media groups, outdated contact lists, privacy concerns (especially regarding the public exposure of personal phone numbers), and unverified requests. 

**Badhon** solves this by establishing a secure, consent-driven, least-privilege coordination platform that connects voluntary blood donors with verified emergency blood requests while rigorously protecting personal privacy and system integrity.

### 1.1 Non-Medical Disclaimer & Platform Boundary
> [!IMPORTANT]
> **Badhon is exclusively a communication and coordination platform.** It is **not** a medical diagnostic authority, blood bank, or blood compatibility determinant. 
> - Medical eligibility screening, cross-matching, blood safety testing, and collection remain the sole responsibility of qualified medical personnel at licensed hospitals and transfusion centers.
> - The platform facilitates candidate discovery and mutual consent; it does not warrant blood safety, compatibility, or donor physical fitness to donate.

---

## 2. Target Audience & Stakeholders

1. **NWU Community:** Current students, faculty members, administrative staff, and registered alumni of North Western University, Khulna.
2. **External Community Donors & Requesters:** Voluntary donors and patient family members in the Khulna metropolitan area and southwestern Bangladesh requiring or offering blood donations.
3. **Campus Volunteer Coordinators & Club Executives:** Badhon NWU campus club volunteers facilitating donor drives and reviewing community reports.
4. **Platform Administrators:** Designated university officials and trusted technical leads overseeing system health, data safety, and user moderation.

---

## 3. User Roles & Access Hierarchy

The system defines 7 explicit authorization levels. Administrative roles are enforced strictly via Firebase Authentication Custom Claims (`admin: true`, `superAdmin: true`), never by user-editable Firestore documents.

| Role | Access Scope | Contact Visibility | Actions Allowed |
| :--- | :--- | :--- | :--- |
| **Guest** | Public website, public sanitized requests, approved public donor cards | None. Contact numbers hidden. | Search sanitized directory, view public emergencies, initiate registration. |
| **Registered User** | Authenticated mobile/web profile | Own profile only | Manage profile, update preferences, submit abuse reports. |
| **Donor** | Donor dashboard, incoming request alerts | Only shared with requester upon explicit request acceptance | Set availability, log last donation date, receive matching alerts, accept/decline requests. |
| **Requester** | Requester dashboard, created requests | Authorized donor contacts only after donor acceptance | Create/update/cancel blood requests, review donor responses, mark requests fulfilled. |
| **Both (Donor & Requester)** | Combined capabilities | Dual permissions governed by distinct sub-workflows | A user may register as both without account duplication. |
| **Admin** | Protected Next.js admin dashboard | Least-privilege access needed for audit/moderation | Moderate requests, review reports, suspend abusive users, inspect notification delivery health. |
| **Super Admin** | Full administrative and configuration controls | Full audit logs, system configurations | Assign/revoke admin roles, adjust rate limits, manage environment flags. |

---

## 4. Key Functional Modules

### 4.1 Onboarding & Authentication
- **Identity Provider:** Google Sign-In via Firebase Authentication (enabling fast, authentic single sign-on using university `@nwu.edu.bd` or personal Google accounts).
- **Bangladeshi Phone Normalization & Verification:** 
  - Regex standard: `^(?:\+8801|01)[3-9]\d{8}$`, normalized to E.164 standard `+8801XXXXXXXXX`.
  - Firebase Phone Auth verification linking to the Google account to establish verified contact identity.
- **Role Assignment:** User explicitly selects Donor, Requester, or Both during onboarding.
- **Affiliation Selection:** NWU Member (Student, Faculty, Staff, Alumni) or External Community Member.

### 4.2 Donor Directory (Sanitized & Privacy-Safe)
- Searchable directory allowing filters by:
  - Blood Group (8 standard ABO/Rh groups).
  - Division (Default: Khulna), District (Default: Khulna), Upazila/Thana.
  - Availability status (Available / Unavailable / In Cooldown).
  - Affiliation (NWU Member vs External).
- **Zero Contact Leakage:** Public cards show *only* Display Name, Blood Group, District/Upazila, Availability, and Affiliation Badge. Phone numbers, emails, student IDs, and private addresses are strictly excluded from public documents.
- Donors can toggle their public directory visibility off at any time while remaining eligible for direct emergency matching.

### 4.3 Blood Request Lifecycle
- Request parameters:
  - Target Blood Group (controlled enum).
  - Number of Donors Needed vs Units Needed (e.g., 2 donors needed, 2 bags required).
  - Hospital/Clinic name & location (e.g., Khulna Medical College Hospital - KMCH).
  - Division, District, Upazila.
  - Urgency level: `NORMAL` (>24 hours), `URGENT` (6–24 hours), `EMERGENCY` (<6 hours).
  - Needed Date & Time (ISO 8601 server timestamp).
  - Minimal necessary clinical situation note (e.g., Thalassemia transfusion, surgical procedure).
- State Machine:
  - `OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `FULFILLED` / `CANCELLED` / `EXPIRED` / `UNDER_REVIEW`.
- Requesters can cancel their own valid requests.
- Scheduled backend cron cleans up expired requests and stops outbound notifications.

### 4.4 Matching & Notification Engine
- **Target Selection:** Queries eligible donors based on matching blood group, geographic location (Upazila/District), availability flag (`isAvailable == true`), and donation cooldown status (>90 days since last donation).
- **Privacy-Safe Dispatch:** Push notifications delivered via FCM containing *no* sensitive patient PII or requester phone numbers.
- **Batching & Rate Limiting:** Dispatches notifications in bounded chunks (max 50 per batch) with exponential backoff and idempotency tracking.
- **In-App Notification Center:** Provides persistent notification history inside Flutter mobile app and web clients.

### 4.5 Donor Consent & Contact-Sharing Workflow
- **The Core Security Boundary:** Requesters *cannot* view donor phone numbers upon request creation.
- A matching donor reviews sanitized request details and clicks **Accept** or **Decline**.
- Acceptance executes an atomic Cloud Function (`respondToRequest`), creating an immutable `contactGrants` document scoped strictly to `(requestId, donorUid, requesterUid)`.
- Requester calls `getAuthorizedContact(requestId, donorUid)` to retrieve the donor's contact number.
- When a request is `CANCELLED`, `FULFILLED`, or `EXPIRED`, the contact grant is marked revoked, preventing further API reads.

### 4.6 Moderation & Administration
- Reporting module for flagging fake requests, commercial blood brokers, harassment, or unresponsive users.
- Protected Admin Portal for review, suspension, request closure, and audit trail examination.

---

## 5. Unresolved Policy Questions & Working Engineering Defaults

The following policy decisions require institutional alignment with North Western University authorities. In accordance with platform governance, **safe, restrictive engineering defaults** are established below:

| # | Policy Question | Unresolved Decision Point | Working Engineering Default (Phase 1) |
| :- | :--- | :--- | :--- |
| **Q1** | **NWU Affiliation Verification** | How should student/faculty membership be formally verified? | **Email Domain + Admin Review:** Accounts with `@nwu.edu.bd` receive automated affiliation verification. Other accounts self-declare affiliation with optional student ID upload, remaining `UNVERIFIED_AFFILIATION` until reviewed by an admin. External users are tagged `EXTERNAL`. |
| **Q2** | **Donor Phone Verification Requirement** | Must donors verify their phone number via SMS OTP before accepting requests? | **Mandatory:** Donors *must* complete Firebase Phone Auth verification before their profile is marked active in the directory or permitted to accept emergency requests. |
| **Q3** | **Contact Fields Shared Post-Acceptance** | What exact contact fields are disclosed to the requester? | **Minimal Contact Only:** Donor Display Name, Primary Verified Phone Number, and optional WhatsApp toggle if donor explicitly consents. Email, home address, and student ID are *never* shared. |
| **Q4** | **Requester Phone Verification Requirement** | Must requesters verify their phone number before receiving donor contact? | **Mandatory:** Requesters must have a verified phone number attached to their account before they can trigger `getAuthorizedContact`. |
| **Q5** | **Data Retention & Anonymization** | How long are requests, audit logs, and reports retained? | **Tiered Retention:**<br>• Active requests expire in 72h max.<br>• Fulfilled/cancelled requests archived for 90 days, then PII scrubbed.<br>• Security audit logs retained for 365 days.<br>• Account deletion removes user PII within 30 days. |
| **Q6** | **Administrative Authorization Hierarchy** | Who can grant Admin roles, and who handles appeals? | **Super Admin Authority:** Initial Super Admin is provisioned via offline CLI script with service account. Super Admin can assign Admin claims to verified NWU staff/coordinators. All role changes are logged to `adminAuditLogs`. |
| **Q7** | **Donor Eligibility & Cooldown Reminders** | What medical rules govern donation intervals and reminders? | **Conservative 90-Day Rule:** System defaults to 90 days (3 months) cooldown for male and female donors following donation. App displays clear disclaimer that local medical staff verify actual hemoglobin/vitals. |
| **Q8** | **Location Precision for Donor Matching** | Should GPS coordinate radius matching or administrative boundaries be used? | **Administrative Hierarchy:** Matching matches by District and Upazila/Thana (plus landmark tags for Khulna city) rather than background GPS tracking, preserving battery and donor location privacy. |

---

## 6. Non-Functional Requirements (NFRs)

- **Security & Privacy:** Default-deny database rules; no secret keys in mobile/web bundles; zero PII leakage in public queries or push notifications.
- **Performance:** Directory query response under 300ms on 3G/4G connections; initial web page load under 1.5s (LCP < 2.0s).
- **Accessibility:** WCAG 2.1 AA compliance; contrast ratio $\ge 4.5:1$ for normal text; minimum $48 \times 48\text{ dp}$ touch target sizes on mobile.
- **Reliability:** Zero duplicate response creation under concurrent user actions; idempotent background processing for notifications.
- **Compliance:** Full alignment with Bangladeshi digital communications practices and user consent standards.
