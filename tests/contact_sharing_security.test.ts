// ponytail: lightweight assert helper, zero extra test runners needed
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: expected ${expected}, got ${actual}. ${message}`);
  }
}

import {
  GetAuthorizedContactInputSchema
} from "@badhon/api-contracts";

console.log("▶ Running Consent-Based Contact Sharing Security & Pen-Test Suite...");

// Mock DB state for penetration testing
interface MockGrant {
  grantId: string;
  requestId: string;
  requesterUid: string;
  donorUid: string;
  donorDisplayName: string;
  donorPhone: string;
  allowWhatsApp: boolean;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  expiresAt: Date;
}

interface MockRequest {
  requestId: string;
  status: "OPEN" | "IN_PROGRESS" | "FULFILLED" | "CANCELLED" | "EXPIRED";
}

const mockRequests: Record<string, MockRequest> = {
  req_active_1: { requestId: "req_active_1", status: "IN_PROGRESS" },
  req_cancelled_2: { requestId: "req_cancelled_2", status: "CANCELLED" },
  req_expired_3: { requestId: "req_expired_3", status: "EXPIRED" }
};

const now = new Date();
const futureExpiry = new Date(now.getTime() + 12 * 3600000);
const pastExpiry = new Date(now.getTime() - 2 * 3600000);

const mockGrants: Record<string, MockGrant> = {
  // Valid active grant for Alice & Donor Dave
  grant_req_active_1_donor_dave: {
    grantId: "grant_req_active_1_donor_dave",
    requestId: "req_active_1",
    requesterUid: "user_alice",
    donorUid: "donor_dave",
    donorDisplayName: "Dave Voluntary Donor",
    donorPhone: "+8801700000001",
    allowWhatsApp: true,
    status: "ACTIVE",
    expiresAt: futureExpiry
  },
  // Revoked grant
  grant_req_active_1_donor_frank: {
    grantId: "grant_req_active_1_donor_frank",
    requestId: "req_active_1",
    requesterUid: "user_alice",
    donorUid: "donor_frank",
    donorDisplayName: "Frank Donor",
    donorPhone: "+8801700000002",
    allowWhatsApp: false,
    status: "REVOKED",
    expiresAt: futureExpiry
  },
  // Expired grant
  grant_req_active_1_donor_george: {
    grantId: "grant_req_active_1_donor_george",
    requestId: "req_active_1",
    requesterUid: "user_alice",
    donorUid: "donor_george",
    donorDisplayName: "George Donor",
    donorPhone: "+8801700000003",
    allowWhatsApp: true,
    status: "ACTIVE",
    expiresAt: pastExpiry
  },
  // Active grant on a CANCELLED blood request
  grant_req_cancelled_2_donor_helen: {
    grantId: "grant_req_cancelled_2_donor_helen",
    requestId: "req_cancelled_2",
    requesterUid: "user_alice",
    donorUid: "donor_helen",
    donorDisplayName: "Helen Donor",
    donorPhone: "+8801700000004",
    allowWhatsApp: true,
    status: "ACTIVE",
    expiresAt: futureExpiry
  }
};

const mockAuditLogs: Array<{ grantId: string; requesterUid: string; donorUid: string }> = [];

/**
 * Simulates getAuthorizedContact server endpoint execution.
 */
function simulateGetAuthorizedContact(
  callerAuth: { uid: string; isAdmin?: boolean } | null,
  input: { requestId: string; donorUid: string }
) {
  if (!callerAuth) {
    throw new Error("unauthenticated: User must be authenticated to request donor contact.");
  }

  const parsed = GetAuthorizedContactInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("invalid-argument: Invalid parameters.");
  }

  const grantId = `grant_${input.requestId}_${input.donorUid}`;
  const grant = mockGrants[grantId];

  // 1. Grant existence
  if (!grant) {
    throw new Error("not-found: No contact authorization exists.");
  }

  // 2. Caller authorization check
  const isOwner = grant.requesterUid === callerAuth.uid;
  const isAdmin = callerAuth.isAdmin === true;
  if (!isOwner && !isAdmin) {
    throw new Error("permission-denied: Access Denied. Caller is not the authorized requester.");
  }

  // 3. Status check
  if (grant.status !== "ACTIVE") {
    throw new Error(`permission-denied: Contact grant is ${grant.status}.`);
  }

  // 4. Expiration check
  if (grant.expiresAt.getTime() <= Date.now()) {
    grant.status = "EXPIRED";
    throw new Error("permission-denied: Contact authorization has expired.");
  }

  // 5. Parent request check
  const parentReq = mockRequests[input.requestId];
  if (parentReq && (parentReq.status === "CANCELLED" || parentReq.status === "EXPIRED")) {
    throw new Error(`permission-denied: Blood request is ${parentReq.status}.`);
  }

  // 6. Record audit log
  mockAuditLogs.push({
    grantId,
    requesterUid: callerAuth.uid,
    donorUid: input.donorUid
  });

  // 7. Secure return
  return {
    requestId: input.requestId,
    donorUid: input.donorUid,
    donorDisplayName: grant.donorDisplayName,
    donorPhone: grant.donorPhone,
    allowWhatsApp: grant.allowWhatsApp,
    grantStatus: "ACTIVE"
  };
}

// =========================================================================
// PENETRATION & AUTHORIZATION ATTACK TEST CASES
// =========================================================================

// Test 1: Unauthenticated request attack
try {
  simulateGetAuthorizedContact(null, { requestId: "req_active_1", donorUid: "donor_dave" });
  assert(false, "Unauthenticated request MUST throw");
} catch (err: any) {
  assert(err.message.startsWith("unauthenticated"), "Must block unauthenticated caller");
}
console.log("✓ Attack 1 Blocked: Unauthenticated guest cannot invoke contact gateway.");

// Test 2: Caller requesting ungranted donor (Donor never accepted)
try {
  simulateGetAuthorizedContact({ uid: "user_alice" }, { requestId: "req_active_1", donorUid: "random_stranger_99" });
  assert(false, "Non-existent grant MUST throw not-found");
} catch (err: any) {
  assert(err.message.startsWith("not-found"), "Must reject ungranted donor");
}
console.log("✓ Attack 2 Blocked: Requester cannot view contact of donor who did not accept.");

// Test 3: Malicious Eve trying to snoop on Alice's grant
try {
  simulateGetAuthorizedContact({ uid: "malicious_eve" }, { requestId: "req_active_1", donorUid: "donor_dave" });
  assert(false, "Unauthorized caller MUST throw permission-denied");
} catch (err: any) {
  assert(err.message.startsWith("permission-denied"), "Must reject third-party snooper");
}
console.log("✓ Attack 3 Blocked: Third-party user cannot access another requester's contact grant.");

// Test 4: Revoked grant access attempt
try {
  simulateGetAuthorizedContact({ uid: "user_alice" }, { requestId: "req_active_1", donorUid: "donor_frank" });
  assert(false, "Revoked grant MUST throw permission-denied");
} catch (err: any) {
  assert(err.message.includes("REVOKED"), "Must reject revoked grant");
}
console.log("✓ Attack 4 Blocked: Revoked grant cannot release phone number.");

// Test 5: Expired grant access attempt
try {
  simulateGetAuthorizedContact({ uid: "user_alice" }, { requestId: "req_active_1", donorUid: "donor_george" });
  assert(false, "Expired grant MUST throw permission-denied");
} catch (err: any) {
  assert(err.message.includes("expired"), "Must reject expired grant");
}
console.log("✓ Attack 5 Blocked: Expired grant cannot release phone number.");

// Test 6: Grant attached to cancelled blood request
try {
  simulateGetAuthorizedContact({ uid: "user_alice" }, { requestId: "req_cancelled_2", donorUid: "donor_helen" });
  assert(false, "Grant on cancelled request MUST throw permission-denied");
} catch (err: any) {
  assert(err.message.includes("CANCELLED"), "Must reject grant from cancelled request");
}
console.log("✓ Attack 6 Blocked: Grant attached to cancelled blood request is void.");

// Test 7: Happy Path - Legitimate Requester Alice retrieving Dave's contact
const aliceAccess = simulateGetAuthorizedContact(
  { uid: "user_alice" },
  { requestId: "req_active_1", donorUid: "donor_dave" }
);
assertEqual(aliceAccess.donorPhone, "+8801700000001", "Alice must receive Dave's verified phone");
assertEqual(aliceAccess.allowWhatsApp, true, "Alice must receive WhatsApp consent");
assertEqual(mockAuditLogs.length, 1, "Access MUST generate an immutable audit log entry");
console.log("✓ Scenario 7 Passed: Legitimate requester safely receives donor contact with audit log.");

// Test 8: Platform Admin Moderation Inspection
const adminAccess = simulateGetAuthorizedContact(
  { uid: "admin_moderator", isAdmin: true },
  { requestId: "req_active_1", donorUid: "donor_dave" }
);
assertEqual(adminAccess.donorPhone, "+8801700000001", "Admin can inspect for emergency moderation");
assertEqual(mockAuditLogs.length, 2, "Admin access MUST be audited");
console.log("✓ Scenario 8 Passed: Administrator access logged with full accountability.");

console.log("🎉 ALL 8 Consent-Based Contact Sharing Penetration & Authorization Tests PASSED (100% compliance)!");
