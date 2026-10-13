import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {
  AdminModerateUserInputSchema,
  AdminModerateRequestInputSchema,
  AdminAssignRoleInputSchema,
  SubmitReportInputSchema
} from "@badhon/api-contracts";

const db = admin.firestore();

/**
 * Admin: Suspends or reactivates a user account.
 * Requires `admin: true` or `superAdmin: true` custom claim.
 */
export const adminModerateUser = onCall(async (request) => {
  if (!request.auth || (!request.auth.token.admin && !request.auth.token.superAdmin)) {
    throw new HttpsError("permission-denied", "Admin privileges required.");
  }

  const parsed = AdminModerateUserInputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Invalid moderation payload.", parsed.error.format());
  }

  const { targetUid, action, reason } = parsed.data;
  const adminUid = request.auth.uid;
  const newStatus = action === "SUSPEND" ? "SUSPENDED" : "ACTIVE";

  const userRef = db.collection("users").doc(targetUid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    throw new HttpsError("not-found", `Target user ${targetUid} does not exist.`);
  }

  const previousStatus = userSnap.data()?.accountStatus || "ACTIVE";

  // Update user account moderation status
  await userRef.update({
    accountStatus: newStatus,
    moderationReason: reason || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // If suspended, immediately remove or hide from public donor directory
  if (action === "SUSPEND") {
    await db.collection("donorPublic").doc(targetUid).delete();
  }

  // Record immutable entry in adminAuditLogs
  const auditLogRef = db.collection("adminAuditLogs").doc();
  const logId = auditLogRef.id;

  await auditLogRef.set({
    logId,
    adminUid,
    action: `USER_${action}`,
    targetType: "USER",
    targetId: targetUid,
    reason: reason || "",
    metadata: { previousStatus, newStatus },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    targetUid,
    accountStatus: newStatus,
    logId
  };
});

/**
 * Admin: Force-cancels or places a blood request under review.
 * Requires `admin: true` or `superAdmin: true` custom claim.
 */
export const adminModerateRequest = onCall(async (request) => {
  if (!request.auth || (!request.auth.token.admin && !request.auth.token.superAdmin)) {
    throw new HttpsError("permission-denied", "Admin privileges required.");
  }

  const parsed = AdminModerateRequestInputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Invalid request moderation action.", parsed.error.format());
  }

  const { requestId, action, reason } = parsed.data;
  const adminUid = request.auth.uid;
  const targetStatus = action === "FORCE_CANCEL" ? "CANCELLED" : "UNDER_REVIEW";

  const reqRef = db.collection("bloodRequests").doc(requestId);
  const reqSnap = await reqRef.get();
  if (!reqSnap.exists) {
    throw new HttpsError("not-found", `Blood request ${requestId} does not exist.`);
  }

  const previousStatus = reqSnap.data()?.status || "OPEN";

  // Update request status
  await reqRef.update({
    status: targetStatus,
    adminActionReason: reason || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // If force cancelled, revoke any active contact grants
  if (action === "FORCE_CANCEL") {
    const grantsSnap = await db
      .collection("contactGrants")
      .where("requestId", "==", requestId)
      .where("status", "==", "ACTIVE")
      .get();

    if (!grantsSnap.empty) {
      const batch = db.batch();
      grantsSnap.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: "REVOKED",
          revocationReason: `Administrative force cancellation: ${reason || "Policy violation"}`,
          revokedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
    }
  }

  // Record audit log
  const auditLogRef = db.collection("adminAuditLogs").doc();
  const logId = auditLogRef.id;

  await auditLogRef.set({
    logId,
    adminUid,
    action: `REQUEST_${action}`,
    targetType: "REQUEST",
    targetId: requestId,
    reason: reason || "",
    metadata: { previousStatus, targetStatus },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    requestId,
    status: targetStatus,
    logId
  };
});

/**
 * Super Admin: Assigns or revokes administrative roles.
 * Strictly requires `superAdmin: true` custom claim.
 */
export const adminAssignRole = onCall(async (request) => {
  if (!request.auth || request.auth.token.superAdmin !== true) {
    throw new HttpsError("permission-denied", "Super Admin privileges strictly required to assign roles.");
  }

  const parsed = AdminAssignRoleInputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Invalid role assignment payload.", parsed.error.format());
  }

  const { targetUid, roles, reason } = parsed.data;
  const adminUid = request.auth.uid;

  // Retrieve existing custom claims
  const userRecord = await admin.auth().getUser(targetUid);
  const existingClaims = userRecord.customClaims || {};

  const updatedClaims = {
    ...existingClaims,
    ...roles
  };

  // Set updated custom user claims in Firebase Auth
  await admin.auth().setCustomUserClaims(targetUid, updatedClaims);

  // Record immutable entry in adminAuditLogs
  const auditLogRef = db.collection("adminAuditLogs").doc();
  const logId = auditLogRef.id;

  await auditLogRef.set({
    logId,
    adminUid,
    action: "ASSIGN_ROLE",
    targetType: "USER",
    targetId: targetUid,
    reason: reason || "",
    metadata: { previousClaims: existingClaims, newClaims: updatedClaims },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    targetUid,
    claimsApplied: roles,
    logId
  };
});

/**
 * Submits an abuse, fraud, or spam report.
 * Accessible to any authenticated user.
 */
export const submitReport = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated to submit a report.");
  }

  const parsed = SubmitReportInputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Invalid report payload.", parsed.error.format());
  }

  const { targetType, targetId, category, details } = parsed.data;
  const reporterUid = request.auth.uid;

  const reportRef = db.collection("reports").doc();
  const reportId = reportRef.id;

  await reportRef.set({
    reportId,
    reporterUid,
    targetType,
    targetId,
    category,
    details,
    status: "PENDING",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    reportId,
    status: "PENDING",
    createdAt: new Date().toISOString()
  };
});
