# API Contracts & Callable Functions Specification
## Badhon (NWU Blood Connect)
**Platform Name:** Badhon (বাঁধন) — NWU Blood Connect  
**Protocol:** Firebase Cloud Functions v2 (HTTPS Callable & Scheduled)  
**Document Version:** 1.0.0  
**Phase:** Phase 1 — Requirements and Architecture  
**Date:** October 2026  

---

## 1. Overview & Standard Protocols

All mutating and security-sensitive operations are exposed as Firebase HTTPS Callable Cloud Functions. Callable functions provide automatic Google ID token decoding, contextual authentication (`request.auth`), App Check token verification (`request.app`), and typed JSON transport.

### 1.1 Standard Error Envelope
All functions return errors using standard Firebase Functions `HttpsError` codes with structured detail payloads:

```typescript
export interface ApiErrorResponse {
  error: {
    code: 
      | "UNAUTHENTICATED"
      | "PERMISSION_DENIED"
      | "INVALID_ARGUMENT"
      | "NOT_FOUND"
      | "ALREADY_EXISTS"
      | "FAILED_PRECONDITION"
      | "RESOURCE_EXHAUSTED"
      | "INTERNAL";
    message: string;
    details?: Record<string, unknown>;
  };
}
```

---

## 2. Callable Functions Catalog

### 2.1 `createBloodRequest`
*Creates a new emergency blood request, validates parameters, and queues matching notifications.*
- **Auth Required:** Yes (Authenticated User with verified phone).
- **Rate Limit:** Max 3 active requests per user concurrently.

#### Request Contract:
```typescript
export interface CreateBloodRequestInput {
  bloodGroup: 
    | "A_POSITIVE" | "A_NEGATIVE" 
    | "B_POSITIVE" | "B_NEGATIVE" 
    | "AB_POSITIVE" | "AB_NEGATIVE" 
    | "O_POSITIVE" | "O_NEGATIVE";
  donorsNeeded: number; // Integer, 1 to 10
  unitsNeeded: number;  // Integer, 1 to 10
  hospitalName: string; // 2 to 100 characters
  hospitalAddress: string; // 5 to 150 characters
  division: string; // Default: "Khulna"
  district: string; // Default: "Khulna"
  upazila: string;  // Upazila / Thana
  neededAt: string; // ISO 8601 Timestamp, must be future (within 72 hours)
  urgency: "NORMAL" | "URGENT" | "EMERGENCY";
  clinicalDetails?: string; // Optional, max 250 characters
  idempotencyKey?: string;  // UUID
}
```

#### Response Contract:
```typescript
export interface CreateBloodRequestOutput {
  requestId: string;
  status: "OPEN";
  createdAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  potentialDonorsNotified: number;
}
```

---

### 2.2 `updateBloodRequestStatus`
*Transitions a request's state to FULFILLED or CANCELLED.*
- **Auth Required:** Yes (Must be the original `requesterUid` or Admin).

#### Request Contract:
```typescript
export interface UpdateBloodRequestStatusInput {
  requestId: string;
  newStatus: "FULFILLED" | "CANCELLED";
  reason?: string; // Optional explanation (max 200 chars)
}
```

#### Response Contract:
```typescript
export interface UpdateBloodRequestStatusOutput {
  requestId: string;
  previousStatus: string;
  currentStatus: "FULFILLED" | "CANCELLED";
  updatedAt: string;
  grantsRevokedCount: number;
}
```

---

### 2.3 `respondToRequest`
*Allows an eligible donor to accept or decline an emergency request.*
- **Auth Required:** Yes (Authenticated Donor with active profile and cooldown passed).

#### Request Contract:
```typescript
export interface RespondToRequestInput {
  requestId: string;
  action: "ACCEPT" | "DECLINE";
  declineReason?: string; // Optional (e.g., "Recently donated", "Traveling")
}
```

#### Response Contract:
```typescript
export interface RespondToRequestOutput {
  responseId: string;
  action: "ACCEPT" | "DECLINE";
  requestId: string;
  grantCreated: boolean;
  message: string;
}
```

#### Expected Errors:
- `FAILED_PRECONDITION`: If request is `FULFILLED`, `CANCELLED`, or `EXPIRED`.
- `ALREADY_EXISTS`: If donor has already recorded an `ACCEPT` response for this request.
- `RESOURCE_EXHAUSTED`: If all required donor slots (`donorsNeeded`) are already filled.

---

### 2.4 `getAuthorizedContact`
*Retrieves the verified phone number of an accepted donor for a specific request.*
- **Auth Required:** Yes (Must be the verified requester who created the request).

#### Request Contract:
```typescript
export interface GetAuthorizedContactInput {
  requestId: string;
  donorUid: string;
}
```

#### Response Contract:
```typescript
export interface GetAuthorizedContactOutput {
  requestId: string;
  donorUid: string;
  donorDisplayName: string;
  donorPhone: string; // Normalized E.164 (+8801XXXXXXXXX)
  allowWhatsApp: boolean;
  grantedAt: string; // ISO 8601
  grantStatus: "ACTIVE";
}
```

#### Expected Errors:
- `PERMISSION_DENIED`: Caller is not the requester, or donor has not accepted, or grant has been revoked due to cancellation.

---

### 2.5 `registerDeviceToken`
*Registers an FCM token for background matching notifications.*
- **Auth Required:** Yes.

#### Request Contract:
```typescript
export interface RegisterDeviceTokenInput {
  token: string;
  platform: "android" | "web" | "ios";
  deviceModel?: string;
}
```

#### Response Contract:
```typescript
export interface RegisterDeviceTokenOutput {
  success: boolean;
  registeredAt: string;
}
```

---

### 2.6 `submitReport`
*Submits an abuse, fraud, or spam report for moderation.*
- **Auth Required:** Yes.

#### Request Contract:
```typescript
export interface SubmitReportInput {
  targetType: "USER" | "REQUEST";
  targetId: string;
  category: "SPAM" | "COMMERCIAL_BROKER" | "HARASSMENT" | "FAKE_REQUEST" | "OTHER";
  details: string; // Max 500 characters
}
```

#### Response Contract:
```typescript
export interface SubmitReportOutput {
  reportId: string;
  status: "PENDING";
  createdAt: string;
}
```

---

## 3. Administrative Privileged Functions

### 3.1 `adminModerateUser`
*Suspends or reactivates a user account.*
- **Auth Required:** Yes (Requires Custom Claim `admin: true`).

#### Request Contract:
```typescript
export interface AdminModerateUserInput {
  targetUid: string;
  action: "SUSPEND" | "REACTIVATE";
  reason: string;
}
```

#### Response Contract:
```typescript
export interface AdminModerateUserOutput {
  targetUid: string;
  accountStatus: "SUSPENDED" | "ACTIVE";
  logId: string;
}
```

---

### 3.2 `adminModerateRequest`
*Force-closes or reviews a reported blood request.*
- **Auth Required:** Yes (Requires Custom Claim `admin: true`).

#### Request Contract:
```typescript
export interface AdminModerateRequestInput {
  requestId: string;
  action: "FORCE_CANCEL" | "MARK_UNDER_REVIEW" | "REINSTATE";
  reason: string;
}
```

#### Response Contract:
```typescript
export interface AdminModerateRequestOutput {
  requestId: string;
  status: string;
  logId: string;
}
```

---

### 3.3 `adminAssignRole`
*Grants or revokes admin privileges.*
- **Auth Required:** Yes (Requires Custom Claim `superAdmin: true`).

#### Request Contract:
```typescript
export interface AdminAssignRoleInput {
  targetUid: string;
  roles: {
    admin?: boolean;
    superAdmin?: boolean;
  };
  reason: string;
}
```

#### Response Contract:
```typescript
export interface AdminAssignRoleOutput {
  targetUid: string;
  claimsApplied: {
    admin?: boolean;
    superAdmin?: boolean;
  };
  logId: string;
}
```

---

## 4. Background & Scheduled Triggers

### 4.1 `cleanupExpiredRequests`
*Scheduled cron executing every 15 minutes.*
- **Schedule:** `every 15 minutes`
- **Actions:**
  1. Queries `bloodRequests` where `status in ['OPEN', 'IN_PROGRESS']` and `expiresAt <= now()`.
  2. Updates request status to `EXPIRED`.
  3. Updates `requestPublic` to `EXPIRED`.
  4. Revokes all linked `contactGrants`.
  5. Emits expiry in-app notifications to requester.

### 4.2 `onUserUpdatedSyncPublic`
*Firestore trigger on `users/{uid}` and `donorPrivate/{uid}`.*
- **Actions:** Computes sanitized public projection and writes atomically to `donorPublic/{uid}`.
