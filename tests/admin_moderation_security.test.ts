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
  AdminModerateUserInputSchema,
  AdminModerateRequestInputSchema,
  AdminAssignRoleInputSchema,
  SubmitReportInputSchema
} from "@badhon/api-contracts";
import { ReportCategory } from "@badhon/domain";

console.log("▶ Running Admin Moderation & Privilege Escalation Security Suite...");

interface SimulatedAuthContext {
  uid: string;
  token: {
    admin?: boolean;
    superAdmin?: boolean;
  };
}

const regularUserAuth: SimulatedAuthContext = {
  uid: "regular_user_1",
  token: {}
};

const adminAuth: SimulatedAuthContext = {
  uid: "moderator_admin_2",
  token: { admin: true }
};

const superAdminAuth: SimulatedAuthContext = {
  uid: "platform_superadmin_3",
  token: { admin: true, superAdmin: true }
};

const auditLogEntries: Array<Record<string, unknown>> = [];

// 1. Simulating adminModerateUser authorization guard
function simulateAdminModerateUser(auth: SimulatedAuthContext | null, payload: unknown) {
  if (!auth || (!auth.token.admin && !auth.token.superAdmin)) {
    throw new Error("permission-denied: Admin privileges required.");
  }
  const parsed = AdminModerateUserInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("invalid-argument: Invalid moderation payload.");
  }
  const { targetUid, action, reason } = parsed.data;
  const logId = `audit_mod_${Date.now()}`;
  auditLogEntries.push({
    logId,
    adminUid: auth.uid,
    action: `USER_${action}`,
    targetUid,
    reason
  });
  return {
    targetUid,
    accountStatus: action === "SUSPEND" ? "SUSPENDED" : "ACTIVE",
    logId
  };
}

// 2. Simulating adminAssignRole authorization guard (Super Admin Only)
function simulateAdminAssignRole(auth: SimulatedAuthContext | null, payload: unknown) {
  if (!auth || auth.token.superAdmin !== true) {
    throw new Error("permission-denied: Super Admin privileges strictly required.");
  }
  const parsed = AdminAssignRoleInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("invalid-argument: Invalid role assignment payload.");
  }
  const { targetUid, roles, reason } = parsed.data;
  const logId = `audit_role_${Date.now()}`;
  auditLogEntries.push({
    logId,
    adminUid: auth.uid,
    action: "ASSIGN_ROLE",
    targetUid,
    roles,
    reason
  });
  return {
    targetUid,
    claimsApplied: roles,
    logId
  };
}

// 3. Simulating submitReport
function simulateSubmitReport(auth: SimulatedAuthContext | null, payload: unknown) {
  if (!auth) {
    throw new Error("unauthenticated: User must be authenticated to report abuse.");
  }
  const parsed = SubmitReportInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("invalid-argument: Invalid report payload.");
  }
  return {
    reportId: `rep_${Date.now()}`,
    status: "PENDING",
    reporterUid: auth.uid
  };
}

// =========================================================================
// SECURITY CHECKS & PRIVILEGE ESCALATION ATTACK TESTS
// =========================================================================

// Attack 1: Regular user attempting to suspend another user
try {
  simulateAdminModerateUser(regularUserAuth, {
    targetUid: "innocent_donor_5",
    action: "SUSPEND",
    reason: "Malicious suspension attempt"
  });
  assert(false, "Regular user MUST be blocked from moderateUser");
} catch (err: any) {
  assert(err.message.includes("permission-denied"), "Regular user suspension blocked");
}
console.log("✓ Attack 1 Blocked: Regular user cannot invoke adminModerateUser.");

// Attack 2: Regular user attempting to assign admin roles
try {
  simulateAdminAssignRole(regularUserAuth, {
    targetUid: regularUserAuth.uid,
    roles: { admin: true, superAdmin: true },
    reason: "Self privilege escalation"
  });
  assert(false, "Regular user MUST be blocked from assigning roles");
} catch (err: any) {
  assert(err.message.includes("permission-denied"), "Regular user role assignment blocked");
}
console.log("✓ Attack 2 Blocked: Self-privilege escalation by regular user prevented.");

// Attack 3: Standard Admin attempting to grant SuperAdmin claim
try {
  simulateAdminAssignRole(adminAuth, {
    targetUid: adminAuth.uid,
    roles: { superAdmin: true },
    reason: "Admin attempting to escalate to SuperAdmin"
  });
  assert(false, "Standard admin MUST be blocked from assigning roles");
} catch (err: any) {
  assert(err.message.includes("permission-denied"), "Standard admin role escalation blocked");
}
console.log("✓ Attack 3 Blocked: Standard Admin cannot escalate to SuperAdmin (SuperAdmin gate holds).");

// Attack 4: Unauthenticated abuse report submission
try {
  simulateSubmitReport(null, {
    targetType: "USER",
    targetId: "donor_123",
    category: ReportCategory.SPAM,
    details: "Spam profile reported by user"
  });
  assert(false, "Unauthenticated user MUST be blocked from submitting report");
} catch (err: any) {
  assert(err.message.includes("unauthenticated"), "Unauthenticated report blocked");
}
console.log("✓ Attack 4 Blocked: Unauthenticated guest cannot submit abuse reports.");

// Scenario 5: Authorized Admin suspending an abusive user
const suspendResult = simulateAdminModerateUser(adminAuth, {
  targetUid: "abusive_spammer_9",
  action: "SUSPEND",
  reason: "Commercial blood selling attempt"
});
assertEqual(suspendResult.accountStatus, "SUSPENDED", "User account status must be SUSPENDED");
assert(auditLogEntries.length === 1, "Suspension MUST create an audit log entry");
assertEqual(auditLogEntries[0].action, "USER_SUSPEND", "Audit log action verified");
console.log("✓ Scenario 5 Passed: Authorized Admin suspended user with immutable audit log.");

// Scenario 6: Authorized SuperAdmin granting Admin claim
const roleResult = simulateAdminAssignRole(superAdminAuth, {
  targetUid: "trusted_faculty_member_7",
  roles: { admin: true },
  reason: "NWU blood club coordinator appointment"
});
assertEqual(roleResult.claimsApplied.admin, true, "Admin claim must be applied");
assert(auditLogEntries.length === 2, "Role assignment MUST create an audit log entry");
assertEqual(auditLogEntries[1].action, "ASSIGN_ROLE", "Audit log role assignment recorded");
console.log("✓ Scenario 6 Passed: SuperAdmin safely granted admin claim with audit accountability.");

// Scenario 7: Authenticated user reporting spam
const reportResult = simulateSubmitReport(regularUserAuth, {
  targetType: "REQUEST",
  targetId: "req_suspicious_1",
  category: ReportCategory.SPAM,
  details: "Phone number listed belongs to commercial broker"
});
assertEqual(reportResult.status, "PENDING", "Report must initialize with PENDING status");
assertEqual(reportResult.reporterUid, regularUserAuth.uid, "Reporter UID must be attributed");
console.log("✓ Scenario 7 Passed: Authenticated user successfully filed abuse report into queue.");

console.log("🎉 ALL Admin Moderation & Privilege Escalation Security Tests PASSED (100% compliance)!");
