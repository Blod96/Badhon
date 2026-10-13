import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GetAuthorizedContactInputSchema } from "@badhon/api-contracts";

const db = admin.firestore();

/**
 * Phase 7: Server-Mediated Contact Sharing Gateway
 *
 * CRITICAL SECURITY INVARIANT:
 * Direct reads to `contactGrants` are denied to all clients via Firestore rules.
 * Phone numbers are ONLY released through this endpoint when:
 * 1. An active grant exists for (requestId, donorUid).
 * 2. Caller is the verified requester who owns the request (or platform admin).
 * 3. The grant status is strictly 'ACTIVE' (not revoked or expired).
 * 4. Neither the grant nor the blood request has expired.
 *
 * Every contact retrieval creates an audit trail entry.
 */
export const getAuthorizedContact = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated to request donor contact.");
  }

  const parsed = GetAuthorizedContactInputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Invalid query parameters.", parsed.error.format());
  }

  const { requestId, donorUid } = parsed.data;
  const callerUid = request.auth.uid;
  const isAdmin = request.auth.token.admin === true || request.auth.token.superAdmin === true;

  const grantId = `grant_${requestId}_${donorUid}`;
  const grantDocRef = db.collection("contactGrants").doc(grantId);
  const grantSnap = await grantDocRef.get();

  // 1. Verify Grant Existence
  if (!grantSnap.exists) {
    throw new HttpsError(
      "not-found",
      "No contact authorization exists. Donor has not accepted this request or grant was not issued."
    );
  }

  const grantData = grantSnap.data() || {};

  // 2. Authorization: Caller MUST be the requester who created the request, or an Admin
  if (grantData.requesterUid !== callerUid && !isAdmin) {
    throw new HttpsError(
      "permission-denied",
      "Access Denied: You are not authorized to access this donor's contact details."
    );
  }

  // 3. Grant Status Check
  if (grantData.status !== "ACTIVE") {
    throw new HttpsError(
      "permission-denied",
      `Contact grant is no longer active (Status: ${grantData.status}).`
    );
  }

  // 4. Time-based Expiration Check
  const now = admin.firestore.Timestamp.now();
  if (grantData.expiresAt && grantData.expiresAt.toMillis() <= now.toMillis()) {
    // Mark grant as expired in background
    await grantDocRef.update({
      status: "EXPIRED",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    throw new HttpsError("permission-denied", "Contact authorization has expired.");
  }

  // 5. Parent Request Status Check
  const requestSnap = await db.collection("bloodRequests").doc(requestId).get();
  if (requestSnap.exists) {
    const reqData = requestSnap.data() || {};
    if (reqData.status === "CANCELLED" || reqData.status === "EXPIRED") {
      throw new HttpsError(
        "permission-denied",
        `Associated blood request has been ${reqData.status.toLowerCase()}. Contact access is closed.`
      );
    }
  }

  // 6. Record Immutable Audit Trail
  await db.collection("contactAccessAuditLogs").add({
    grantId,
    requestId,
    donorUid,
    requesterUid: callerUid,
    accessedByAdmin: isAdmin && grantData.requesterUid !== callerUid,
    accessedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // 7. Securely Return Unlocked Contact Data
  return {
    requestId,
    donorUid,
    donorDisplayName: grantData.donorDisplayName || "Verified Donor",
    donorPhone: grantData.donorPhone,
    allowWhatsApp: grantData.allowWhatsApp ?? true,
    grantedAt: grantData.grantedAt?.toDate ? grantData.grantedAt.toDate().toISOString() : new Date().toISOString(),
    grantStatus: "ACTIVE"
  };
});
