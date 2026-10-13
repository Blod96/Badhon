# Database Schema Specification
## Badhon (NWU Blood Connect)
**Platform Name:** Badhon (বাঁধন) — NWU Blood Connect  
**Database:** Google Cloud Firestore (Native Mode)  
**Document Version:** 1.0.0  
**Phase:** Phase 1 — Requirements and Architecture  
**Date:** October 2026  

---

## 1. Schema Design Principles

1. **Document-Level Security Boundary:** Firestore rules cannot mask fields inside a single document. Sensitive contact information is strictly segregated into dedicated private collections, with sanitized summaries mirrored to public collections.
2. **Server-Managed State Transitions:** All critical state changes (request status, donor acceptance, contact grant authorization, admin moderation) are executed via trusted Cloud Functions.
3. **Deterministic Document IDs:** Used across relational collections (responses, grants) to prevent race conditions and duplicate operations.
4. **Strict Timestamps:** All dates and times are stored as native Firestore `Timestamp` objects (or normalized `YYYY-MM-DD` strings for calendar dates).

---

## 2. Collection Schema Definitions

### 2.1 Collection: `users/{uid}`
*Master user identity record. Created upon initial Google Sign-In and profile completion.*
- **Ownership:** Owned by `uid`.
- **Read Access:** Authenticated owner and Admins.
- **Write Access:** Authenticated owner (permitted profile fields only) or Admin SDK.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `uid` | `string` | Immutable, PK | Firebase Authentication UID. |
| `displayName` | `string` | Min 2, max 60 chars | User's full name. |
| `email` | `string` | Valid email, immutable | Primary email from Google Auth. |
| `phoneNumber` | `string?` | Normalized E.164 (`+8801...`) | Primary verified phone number. |
| `isPhoneVerified` | `boolean` | Default `false` | Phone OTP verification state. |
| `bloodGroup` | `string` | Enum `BloodGroup` | Controlled blood group enum. |
| `roles` | `array<string>` | `DONOR`, `REQUESTER` | User capability flags. |
| `affiliationType` | `string` | Enum `AffiliationType` | `NWU_MEMBER` or `EXTERNAL`. |
| `department` | `string?` | Max 50 chars | NWU department (e.g., CSE, EEE, BBA). |
| `nwuId` | `string?` | Max 20 chars | Optional student/employee ID. |
| `affiliationVerified`| `boolean`| Default `false`, Server-only| University membership verification status. |
| `division` | `string` | Default `"Khulna"` | Division. |
| `district` | `string` | Default `"Khulna"` | District. |
| `upazila` | `string` | Non-empty | Upazila / Thana. |
| `accountStatus` | `string` | Enum: `ACTIVE`, `SUSPENDED` | Account moderation status. |
| `createdAt` | `Timestamp` | Server-assigned, immutable | Account creation timestamp. |
| `updatedAt` | `Timestamp` | Server-assigned | Profile last updated timestamp. |

---

### 2.2 Collection: `donorPrivate/{uid}`
*Private donor settings, private medical eligibility reminders, and notification settings.*
- **Ownership:** Owned by `uid`.
- **Read Access:** Authenticated donor owner only.
- **Write Access:** Authenticated donor owner or Admin SDK.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `uid` | `string` | Immutable, PK | Matches `users.uid`. |
| `isAvailable` | `boolean` | Default `true` | Donor's manual availability toggle. |
| `lastDonationDate` | `string?` | `YYYY-MM-DD` | Date of most recent donation. |
| `nextEligibleDate` | `string?` | `YYYY-MM-DD`, Server-calc | Calculated next eligible donation date (last + 90 days). |
| `notifyOnUrgentOnly`| `boolean`| Default `false` | Preference for emergency-only push alerts. |
| `allowWhatsApp` | `boolean` | Default `true` | Consent to share WhatsApp link upon acceptance. |
| `donationCount` | `number` | Min 0, integer | Lifetime verified donations on platform. |
| `updatedAt` | `Timestamp` | Server-assigned | Last settings update. |

---

### 2.3 Collection: `donorPublic/{uid}`
*Sanitized, publicly queryable donor card. Contains zero private contact details.*
- **Ownership:** Mirrored automatically from `users` and `donorPrivate` via Cloud Functions.
- **Read Access:** Public (all authenticated and unauthenticated guests).
- **Write Access:** Cloud Functions Admin SDK only.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `uid` | `string` | Immutable, PK | Anonymous reference to donor. |
| `displayName` | `string` | Sanitized | Public display name or alias. |
| `bloodGroup` | `string` | Enum `BloodGroup` | Donor's blood group. |
| `division` | `string` | Controlled | Division (e.g., `"Khulna"`). |
| `district` | `string` | Controlled | District (e.g., `"Khulna"`). |
| `upazila` | `string` | Controlled | Upazila (e.g., `"Sonadanga"`, `"Khalishpur"`). |
| `affiliationType` | `string` | Enum `AffiliationType` | Broad affiliation (`NWU_MEMBER` / `EXTERNAL`). |
| `isAvailable` | `boolean` | Boolean | Readily available to donate. |
| `isEligible` | `boolean` | Boolean | True if cooldown expired (>90 days). |
| `isPublicVisible`| `boolean` | Boolean | Donor's public directory listing consent toggle. |
| `verifiedBadge` | `boolean` | Boolean | True if NWU affiliation and phone verified. |
| `updatedAt` | `Timestamp` | Server-assigned | Timestamp of last sync. |

---

### 2.4 Collection: `requesterPrivate/{uid}`
*Requester coordination preferences and saved emergency contacts.*
- **Ownership:** Owned by `uid`.
- **Read Access:** Authenticated requester owner only.
- **Write Access:** Authenticated requester owner.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `uid` | `string` | Immutable, PK | Matches `users.uid`. |
| `defaultHospital`| `string?` | Max 100 chars | Preferred/default medical center. |
| `emergencyContact`| `string?`| Normalized E.164 | Alternate contact phone number. |
| `activeRequestsCount`| `number`| Min 0, integer | Number of currently active requests. |
| `updatedAt` | `Timestamp` | Server-assigned | Timestamp of update. |

---

### 2.5 Collection: `bloodRequests/{requestId}`
*Master blood request document created by an authenticated requester.*
- **Ownership:** Owned by `requesterUid`.
- **Read Access:** Requester owner, accepted donors with valid grants, Admins.
- **Write Access:** Created/updated via Cloud Functions; status changes strictly server-controlled.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `requestId` | `string` | Immutable, PK | Unique UUID / auto-id. |
| `requesterUid` | `string` | Immutable | UID of creator. |
| `requesterName` | `string` | Max 60 chars | Name of requester. |
| `requesterPhone` | `string` | Normalized E.164 | Contact phone (not exposed publicly). |
| `bloodGroup` | `string` | Enum `BloodGroup` | Requested blood group. |
| `donorsNeeded` | `number` | Integer 1–10 | Number of individual donors sought. |
| `unitsNeeded` | `number` | Integer 1–10 | Bags of blood needed. |
| `hospitalName` | `string` | Max 100 chars | Hospital or diagnostic center name. |
| `hospitalAddress`| `string` | Max 150 chars | Local address or landmark. |
| `division` | `string` | Controlled | Division (Khulna). |
| `district` | `string` | Controlled | District (Khulna). |
| `upazila` | `string` | Controlled | Upazila (e.g., Sadar, Daulatpur). |
| `neededAt` | `Timestamp` | Future timestamp | Date and time blood is required. |
| `urgency` | `string` | Enum `Urgency` | `NORMAL`, `URGENT`, `EMERGENCY`. |
| `clinicalDetails`| `string?` | Max 250 chars | Brief non-sensitive clinical context. |
| `status` | `string` | Enum `RequestStatus` | `OPEN`, `IN_PROGRESS`, `FULFILLED`, `CANCELLED`, `EXPIRED`, `UNDER_REVIEW`. |
| `responseCount` | `number` | Integer $\ge 0$ | Total donor responses received. |
| `acceptedCount` | `number` | Integer $\ge 0$ | Total accepted responses. |
| `expiresAt` | `Timestamp` | Server-assigned | Expiration timestamp (max 72h). |
| `createdAt` | `Timestamp` | Server-assigned, immutable | Creation timestamp. |
| `updatedAt` | `Timestamp` | Server-assigned | Last update timestamp. |

---

### 2.6 Collection: `requestPublic/{requestId}`
*Sanitized public summary of an active blood request for public awareness.*
- **Ownership:** Mirrored from `bloodRequests` via Cloud Functions.
- **Read Access:** Public (all users & guests).
- **Write Access:** Cloud Functions Admin SDK only.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `requestId` | `string` | Immutable, PK | Matches `bloodRequests.requestId`. |
| `bloodGroup` | `string` | Enum `BloodGroup` | Target blood group. |
| `unitsNeeded` | `number` | Integer | Units needed. |
| `hospitalName` | `string` | Sanitized | Hospital name. |
| `district` | `string` | Controlled | District. |
| `upazila` | `string` | Controlled | Upazila. |
| `urgency` | `string` | Enum `Urgency` | Urgency level. |
| `neededAt` | `Timestamp` | Timestamp | Required time. |
| `status` | `string` | Enum `RequestStatus` | Current request status. |
| `createdAt` | `Timestamp` | Timestamp | Creation timestamp. |
| `expiresAt` | `Timestamp` | Timestamp | Expiration timestamp. |

---

### 2.7 Collection: `requestResponses/{responseId}`
*Records a donor's decision to accept or decline a request.*
- **Key Format:** Deterministic `resp_${requestId}_${donorUid}`.
- **Read Access:** Requester of `requestId`, responding donor, Admins.
- **Write Access:** Cloud Functions transactional write only.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `responseId` | `string` | Deterministic PK | `resp_${requestId}_${donorUid}`. |
| `requestId` | `string` | Immutable | Targeted request ID. |
| `requesterUid` | `string` | Immutable | Requester's UID. |
| `donorUid` | `string` | Immutable | Responding donor's UID. |
| `donorDisplayName`| `string` | Max 60 chars | Donor name. |
| `action` | `string` | Enum: `ACCEPT`, `DECLINE` | Donor's response. |
| `declineReason` | `string?` | Optional string | Reason if declined. |
| `createdAt` | `Timestamp` | Server-assigned | Response timestamp. |

---

### 2.8 Collection: `contactGrants/{grantId}`
*The core authorization token granting a requester access to a donor's contact number.*
- **Key Format:** Deterministic `grant_${requestId}_${donorUid}`.
- **Read Access:** Cloud Functions Admin SDK only (clients never read directly).
- **Write Access:** Cloud Functions Admin SDK only.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `grantId` | `string` | Deterministic PK | `grant_${requestId}_${donorUid}`. |
| `requestId` | `string` | Immutable | Scoped request. |
| `requesterUid` | `string` | Immutable | Authorized viewer. |
| `donorUid` | `string` | Immutable | Consenting donor. |
| `donorPhone` | `string` | Normalized E.164 | Securely stored verified donor phone. |
| `allowWhatsApp` | `boolean` | Boolean | WhatsApp coordination toggle. |
| `status` | `string` | Enum: `ACTIVE`, `REVOKED`, `EXPIRED` | Grant state. |
| `grantedAt` | `Timestamp` | Server-assigned | Grant creation timestamp. |
| `revokedAt` | `Timestamp?`| Nullable | Timestamp if revoked. |
| `accessCount` | `number` | Integer $\ge 0$ | Times contact was fetched by requester. |
| `lastAccessedAt` | `Timestamp?`| Nullable | Last read timestamp. |

---

### 2.9 Collection: `notifications/{notificationId}`
*In-app persistent notification log for mobile and web notification drawers.*
- **Ownership:** Target recipient `userId`.
- **Read Access:** Authenticated recipient `userId`.
- **Write Access:** Cloud Functions Admin SDK only (recipient may update `isRead: true`).

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `notificationId` | `string` | Unique UUID | Primary key. |
| `userId` | `string` | Indexed recipient | Recipient UID. |
| `type` | `string` | Enum `NotificationType` | `MATCH_ALERT`, `DONOR_RESPONDED`, `REQUEST_CLOSED`, `SYSTEM_NOTICE`. |
| `title` | `string` | Max 80 chars | Clean title. |
| `body` | `string` | Max 200 chars | Privacy-safe body. |
| `requestId` | `string?` | Optional reference | Linked request if applicable. |
| `isRead` | `boolean` | Default `false` | Read status. |
| `createdAt` | `Timestamp` | Server-assigned | Notification creation timestamp. |

---

### 2.10 Collection: `deviceTokens/{uid}/tokens/{tokenId}`
*FCM push notification tokens for user devices.*
- **Ownership:** Authenticated `uid`.
- **Read Access:** Authenticated `uid` owner.
- **Write Access:** Authenticated `uid` owner (register/delete).

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `tokenId` | `string` | Hash / token string | FCM registration token. |
| `platform` | `string` | `android`, `web`, `ios` | Client platform. |
| `deviceModel` | `string?` | Max 50 chars | Optional device descriptor. |
| `updatedAt` | `Timestamp` | Server-assigned | Timestamp of last heartbeat/refresh. |

---

### 2.11 Collection: `reports/{reportId}`
*Abuse reports submitted by users for inappropriate behavior or fraudulent requests.*
- **Read Access:** Submitting reporter (own report), Admins.
- **Write Access:** Authenticated reporter (create only via Cloud Function).

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `reportId` | `string` | Unique UUID | Primary key. |
| `reporterUid` | `string` | Immutable | Submitting user. |
| `targetType` | `string` | `USER`, `REQUEST` | Target entity type. |
| `targetId` | `string` | Valid UID or RequestId | Target identifier. |
| `category` | `string` | Enum: `SPAM`, `COMMERCIAL_BROKER`, `HARASSMENT`, `FAKE_REQUEST`, `OTHER` | Report category. |
| `details` | `string` | Max 500 chars | Context and evidence details. |
| `status` | `string` | Enum: `PENDING`, `INVESTIGATING`, `RESOLVED`, `DISMISSED` | Moderation status. |
| `assignedAdminUid`| `string?`| Nullable | Assigned moderator. |
| `resolutionNotes`| `string?` | Max 500 chars | Outcome explanation. |
| `createdAt` | `Timestamp` | Server-assigned | Report timestamp. |

---

### 2.12 Collection: `adminAuditLogs/{logId}`
*Immutable audit trail of all privileged administrative actions.*
- **Read Access:** Super Admins only.
- **Write Access:** Cloud Functions Admin SDK only.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `logId` | `string` | Unique UUID | Primary key. |
| `adminUid` | `string` | Caller UID | Administrator who executed the action. |
| `action` | `string` | Controlled string | Action name (e.g., `SUSPEND_USER`, `CANCEL_REQUEST`, `ASSIGN_ROLE`). |
| `targetResource` | `string` | Resource URI | Target resource path (e.g., `users/xyz`). |
| `metadata` | `map` | JSON object | Non-sensitive details (previous state, new state, reason). |
| `ipAddress` | `string?` | Client IP | Request IP address if available. |
| `timestamp` | `Timestamp` | Server-assigned | Immutable event timestamp. |

---

### 2.13 Collection: `idempotencyKeys/{key}`
*TTL-backed collection preventing duplicate API executions.*
- **Read/Write Access:** Cloud Functions Admin SDK only.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `key` | `string` | Caller provided key | Idempotency key. |
| `callerUid` | `string` | Immutable | Caller UID. |
| `responsePayload`| `map` | Result cache | Cached API response. |
| `createdAt` | `Timestamp` | Server-assigned | Key creation timestamp. |
| `expiresAt` | `Timestamp` | 24-hour TTL | Automatic eviction threshold. |

---

### 2.14 Collection: `systemConfig/{configId}`
*System-wide operational parameters.*
- **Read Access:** Authenticated users (public parameters), Admins.
- **Write Access:** Super Admins via Cloud Function only.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `configId` | `string` | Usually `"main"` | Configuration document key. |
| `maxActiveRequestsPerUser` | `number` | Default `3` | Spam limit on concurrent active requests. |
| `requestExpiryHours` | `number` | Default `48` | Default lifecycle of emergency requests. |
| `donorCooldownDays` | `number` | Default `90` | Minimum days between donations. |
| `emergencyNoticeBanner` | `string?` | Optional string | Campus-wide broadcast banner message. |
| `maintenanceMode` | `boolean` | Default `false` | System maintenance kill-switch. |

---

## 3. Composite Indexes Plan (`firestore.indexes.json`)

To support optimized, low-latency querying, the following composite indexes are configured:

```json
{
  "indexes": [
    {
      "collectionGroup": "donorPublic",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPublicVisible", "order": "ASCENDING" },
        { "fieldPath": "isAvailable", "order": "ASCENDING" },
        { "fieldPath": "bloodGroup", "order": "ASCENDING" },
        { "fieldPath": "district", "order": "ASCENDING" },
        { "fieldPath": "upazila", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "bloodRequests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "requesterUid", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "requestPublic",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "urgency", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isRead", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 4. Data Consistency & Retention Rules

1. **Mirror Consistency:** When `users/{uid}` or `donorPrivate/{uid}` changes, a Cloud Function Firestore trigger computes the sanitized projection and updates `donorPublic/{uid}` within 1.5 seconds.
2. **Request Lifecycle Sync:** When `bloodRequests/{requestId}` transitions to `CANCELLED`, `FULFILLED`, or `EXPIRED`, the trigger automatically updates `requestPublic/{requestId}` and marks linked `contactGrants` as `REVOKED`.
3. **Data Deletion Policy:** User deletion requests purge `users/{uid}`, `donorPrivate/{uid}`, `donorPublic/{uid}`, and device tokens immediately. Completed request records remain archived with phone numbers and names scrubbed to maintain historical donation statistics.
