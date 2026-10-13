import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import {
  CreateBloodRequestInputSchema,
  UpdateBloodRequestStatusInputSchema
} from "@badhon/api-contracts";
import { getExpiryHoursForUrgency } from "@badhon/domain";
import { findMatchingDonors, dispatchNotificationsForRequest } from "./notifications";

const db = admin.firestore();

/**
 * Creates an emergency blood request with schema validation and rate limiting.
 */
export const createBloodRequest = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated to create a blood request.");
  }

  const parsed = CreateBloodRequestInputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Invalid request parameters.", parsed.error.format());
  }

  const { data } = parsed;
  const uid = request.auth.uid;

  // 1. Fetch authenticated user profile to get verified contact information
  const userSnap = await db.collection("users").doc(uid).get();
  const userData = userSnap.data() || {};
  const requesterName = userData.displayName || "Requester";
  const requesterPhone = userData.phoneNumber || "";

  // 2. Enforce Spam Prevention / Rate Limit: max 3 concurrent active OPEN requests per user
  const activeRequestsSnap = await db
    .collection("bloodRequests")
    .where("requesterUid", "==", uid)
    .where("status", "==", "OPEN")
    .get();

  if (activeRequestsSnap.size >= 3) {
    throw new HttpsError(
      "resource-exhausted",
      "Rate limit reached: Maximum 3 active blood requests allowed concurrently."
    );
  }

  // 3. Compute expiration deadline based on clinical urgency
  const expiryHours = getExpiryHoursForUrgency(data.urgency);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);

  // 4. Create request document in private bloodRequests collection
  const requestDocRef = db.collection("bloodRequests").doc();
  const requestId = requestDocRef.id;

  const newRequestRecord = {
    requestId,
    requesterUid: uid,
    requesterName,
    requesterPhone,
    bloodGroup: data.bloodGroup,
    donorsNeeded: data.donorsNeeded,
    unitsNeeded: data.unitsNeeded,
    hospitalName: data.hospitalName,
    hospitalAddress: data.hospitalAddress,
    division: data.division || "Khulna",
    district: data.district || "Khulna",
    upazila: data.upazila,
    neededAt: admin.firestore.Timestamp.fromDate(new Date(data.neededAt)),
    urgency: data.urgency,
    clinicalDetails: data.clinicalDetails || "",
    status: "OPEN",
    responseCount: 0,
    acceptedCount: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt)
  };

  await requestDocRef.set(newRequestRecord);

  // 5. Trigger Matching Engine and Privacy-Safe Notification Dispatch
  let potentialDonorsNotified = 0;
  try {
    const matchedDonors = await findMatchingDonors({
      bloodGroup: data.bloodGroup,
      upazila: data.upazila,
      district: data.district || "Khulna",
      urgency: data.urgency
    });

    potentialDonorsNotified = await dispatchNotificationsForRequest(
      {
        requestId,
        bloodGroup: data.bloodGroup,
        unitsNeeded: data.unitsNeeded,
        hospitalName: data.hospitalName,
        upazila: data.upazila,
        urgency: data.urgency
      },
      matchedDonors.map((d) => d.uid)
    );
  } catch (err) {
    console.error("[MatchingEngine] Background match/dispatch warning:", err);
  }

  return {
    requestId,
    status: "OPEN",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    potentialDonorsNotified
  };
});

/**
 * Updates blood request status (FULFILLED or CANCELLED) with ownership check.
 */
export const updateBloodRequestStatus = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const parsed = UpdateBloodRequestStatusInputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Invalid status update payload.", parsed.error.format());
  }

  const { requestId, newStatus, reason } = parsed.data;
  const uid = request.auth.uid;
  const isAdmin = request.auth.token.admin === true || request.auth.token.superAdmin === true;

  const docRef = db.collection("bloodRequests").doc(requestId);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new HttpsError("not-found", `Blood request ${requestId} does not exist.`);
  }

  const currentData = snap.data() || {};
  const previousStatus = currentData.status;

  // Authorization: Requester owner or Platform Admin
  if (currentData.requesterUid !== uid && !isAdmin) {
    throw new HttpsError("permission-denied", "Only the requester or an administrator can modify this request.");
  }

  // Prevent transitions from terminal states
  if (previousStatus === "FULFILLED" || previousStatus === "CANCELLED" || previousStatus === "EXPIRED") {
    throw new HttpsError("failed-precondition", `Cannot update request that is already ${previousStatus}.`);
  }

  let grantsRevokedCount = 0;

  // If cancelling, revoke any associated active contact grants
  if (newStatus === "CANCELLED") {
    const grantsSnap = await db
      .collection("contactGrants")
      .where("requestId", "==", requestId)
      .where("status", "==", "ACTIVE")
      .get();

    if (!grantsSnap.empty) {
      const batch = db.batch();
      grantsSnap.docs.forEach((grantDoc) => {
        batch.update(grantDoc.ref, {
          status: "REVOKED",
          revocationReason: reason || "Request cancelled by user",
          revokedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
      grantsRevokedCount = grantsSnap.size;
    }
  }

  const now = new Date();
  await docRef.update({
    status: newStatus,
    statusReason: reason || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    requestId,
    previousStatus,
    currentStatus: newStatus,
    updatedAt: now.toISOString(),
    grantsRevokedCount
  };
});

/**
 * Scheduled auto-cleanup running every 15 minutes to expire overdue requests.
 */
export const cleanupExpiredRequests = onSchedule("every 15 minutes", async () => {
  const now = admin.firestore.Timestamp.now();
  const overdueSnap = await db
    .collection("bloodRequests")
    .where("status", "==", "OPEN")
    .where("expiresAt", "<=", now)
    .get();

  if (overdueSnap.empty) {
    console.log("No expired requests found during scheduled run.");
    return;
  }

  const batch = db.batch();
  overdueSnap.docs.forEach((doc) => {
    batch.update(doc.ref, {
      status: "EXPIRED",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
  console.log(`Auto-expired ${overdueSnap.size} overdue blood requests.`);
});

/**
 * Cloud Function Trigger: Automatically synchronizes bloodRequests to requestPublic.
 * CRITICAL PRIVACY INVARIANT:
 * Private phone numbers and internal requester IDs are completely omitted from requestPublic.
 */
export const syncBloodRequestToPublic = onDocumentWritten("bloodRequests/{requestId}", async (event) => {
  const requestId = event.params.requestId;

  if (!event.data?.after.exists) {
    await db.collection("requestPublic").doc(requestId).delete();
    return;
  }

  const data = event.data.after.data() || {};

  // Public-safe sanitized projection per Section 2.6
  const publicPayload = {
    requestId,
    bloodGroup: data.bloodGroup,
    unitsNeeded: data.unitsNeeded,
    hospitalName: data.hospitalName,
    district: data.district || "Khulna",
    upazila: data.upazila,
    urgency: data.urgency,
    neededAt: data.neededAt,
    status: data.status,
    createdAt: data.createdAt,
    expiresAt: data.expiresAt,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection("requestPublic").doc(requestId).set(publicPayload, { merge: true });
});
