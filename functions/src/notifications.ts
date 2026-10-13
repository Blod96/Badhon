import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {
  RegisterDeviceTokenInputSchema,
  RespondToRequestInputSchema
} from "@badhon/api-contracts";
import {
  BloodGroup,
  BloodGroupLabels,
  Urgency,
  getCompatibleDonorGroups
} from "@badhon/domain";

const db = admin.firestore();

export interface MatchedDonor {
  uid: string;
  score: number;
}

/**
 * Matching Engine: Queries and ranks eligible voluntary donors based on
 * blood compatibility, geographic proximity, cooldown, and urgency preferences.
 */
export async function findMatchingDonors(params: {
  bloodGroup: BloodGroup;
  upazila: string;
  district: string;
  urgency: Urgency;
  limit?: number;
}): Promise<MatchedDonor[]> {
  const compatibleGroups = getCompatibleDonorGroups(params.bloodGroup);
  const maxResults = params.limit || 50;

  // Query publicly visible, available, and cooldown-cleared donors matching compatible groups
  const querySnap = await db
    .collection("donorPublic")
    .where("isPublicVisible", "==", true)
    .where("isAvailable", "==", true)
    .where("isEligible", "==", true)
    .where("bloodGroup", "in", compatibleGroups.slice(0, 10))
    .get();

  if (querySnap.empty) {
    return [];
  }

  const matched: MatchedDonor[] = [];

  for (const doc of querySnap.docs) {
    const data = doc.data();
    let score = 0;

    // Upazila match: +100
    if (data.upazila?.toLowerCase() === params.upazila.toLowerCase()) {
      score += 100;
    }
    // District match: +50
    if (data.district?.toLowerCase() === params.district.toLowerCase()) {
      score += 50;
    }
    // Verified NWU affiliation badge: +20
    if (data.verifiedBadge) {
      score += 20;
    }
    // Exact blood group match: +30
    if (data.bloodGroup === params.bloodGroup) {
      score += 30;
    }

    // Check private donor notification preferences (urgent-only filter)
    if (params.urgency !== Urgency.EMERGENCY) {
      const privateDoc = await db.collection("donorPrivate").doc(doc.id).get();
      if (privateDoc.exists && privateDoc.data()?.notifyOnUrgentOnly === true) {
        continue; // Skip non-emergency alerts for donors who requested urgent-only notifications
      }
    }

    matched.push({ uid: doc.id, score });
  }

  // Sort descending by calculated proximity and compatibility score
  matched.sort((a, b) => b.score - a.score);
  return matched.slice(0, maxResults);
}

/**
 * Dispatches in-app notifications and privacy-safe FCM multicast push notifications.
 *
 * CRITICAL PRIVACY INVARIANT:
 * Zero patient phone numbers or names are ever included in notification payloads.
 */
export async function dispatchNotificationsForRequest(requestData: {
  requestId: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospitalName: string;
  upazila: string;
  urgency: Urgency;
}, donorUids: string[]): Promise<number> {
  if (donorUids.length === 0) return 0;

  const bgLabel = BloodGroupLabels[requestData.bloodGroup] || requestData.bloodGroup;
  const title = `Blood Alert: ${bgLabel} Needed`;
  const body = `${requestData.unitsNeeded} unit(s) needed at ${requestData.hospitalName}, ${requestData.upazila}. Can you donate?`;

  const batch = db.batch();
  const fcmTokens: string[] = [];

  for (const uid of donorUids) {
    // 1. Create in-app notification document
    const notifRef = db.collection("notifications").doc();
    batch.set(notifRef, {
      userId: uid,
      title,
      body,
      type: "BLOOD_REQUEST",
      requestId: requestData.requestId,
      urgency: requestData.urgency,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 2. Collect FCM tokens
    const tokensSnap = await db.collection("deviceTokens").doc(uid).collection("tokens").get();
    tokensSnap.docs.forEach((t) => {
      const tokenStr = t.data().token;
      if (tokenStr) fcmTokens.push(tokenStr);
    });
  }

  await batch.commit();

  // 3. Multicast Push Notification in chunks of 50
  if (fcmTokens.length > 0 && admin.messaging) {
    const CHUNK_SIZE = 50;
    for (let i = 0; i < fcmTokens.length; i += CHUNK_SIZE) {
      const chunk = fcmTokens.slice(i, i + CHUNK_SIZE);
      try {
        const messagePayload: admin.messaging.MulticastMessage = {
          tokens: chunk,
          notification: { title, body },
          data: {
            requestId: requestData.requestId,
            bloodGroup: requestData.bloodGroup,
            urgency: requestData.urgency,
            upazila: requestData.upazila,
            hospitalName: requestData.hospitalName
          },
          android: {
            priority: requestData.urgency === Urgency.EMERGENCY ? "high" : "normal"
          }
        };
        await admin.messaging().sendEachForMulticast(messagePayload);
      } catch (err) {
        console.warn("[FCM] Multicast batch dispatch error:", err);
      }
    }
  }

  return donorUids.length;
}

/**
 * Registers an FCM push notification token for an authenticated user.
 */
export const registerDeviceToken = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const parsed = RegisterDeviceTokenInputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Invalid device token parameters.", parsed.error.format());
  }

  const { token, platform, deviceModel } = parsed.data;
  const uid = request.auth.uid;

  await db
    .collection("deviceTokens")
    .doc(uid)
    .collection("tokens")
    .doc(token)
    .set({
      token,
      platform,
      deviceModel: deviceModel || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

  return {
    success: true,
    registeredAt: new Date().toISOString()
  };
});

/**
 * Responds to a blood request (ACCEPT or DECLINE).
 * Executed as an atomic Firestore transaction to prevent race conditions.
 */
export const respondToRequest = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated to respond.");
  }

  const parsed = RespondToRequestInputSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Invalid response action.", parsed.error.format());
  }

  const { requestId, action, declineReason } = parsed.data;
  const donorUid = request.auth.uid;
  const responseId = `resp_${requestId}_${donorUid}`;

  const requestRef = db.collection("bloodRequests").doc(requestId);
  const responseRef = db.collection("requestResponses").doc(responseId);
  const grantId = `grant_${requestId}_${donorUid}`;
  const grantRef = db.collection("contactGrants").doc(grantId);

  const result = await db.runTransaction(async (transaction) => {
    // 1. Check existing response
    const existingResp = await transaction.get(responseRef);
    if (existingResp.exists) {
      const respData = existingResp.data() || {};
      if (respData.action === action) {
        return {
          responseId,
          action,
          requestId,
          grantCreated: action === "ACCEPT",
          message: "Response already recorded (idempotent)."
        };
      }
    }

    // 2. Check blood request state
    const requestSnap = await transaction.get(requestRef);
    if (!requestSnap.exists) {
      throw new HttpsError("not-found", `Blood request ${requestId} was not found.`);
    }

    const requestData = requestSnap.data() || {};
    if (requestData.status !== "OPEN" && requestData.status !== "IN_PROGRESS") {
      throw new HttpsError(
        "failed-precondition",
        `Cannot respond to request that is already ${requestData.status}.`
      );
    }

    // 3. Fetch donor info
    const donorUserSnap = await transaction.get(db.collection("users").doc(donorUid));
    const donorPrivateSnap = await transaction.get(db.collection("donorPrivate").doc(donorUid));

    const donorUserData = donorUserSnap.data() || {};
    const donorPrivateData = donorPrivateSnap.data() || {};

    const donorDisplayName = donorUserData.displayName || "Voluntary Donor";
    const donorPhone = donorUserData.phoneNumber || "";
    const allowWhatsApp = donorPrivateData.allowWhatsApp ?? true;

    // 4. Record Response Document
    transaction.set(responseRef, {
      responseId,
      requestId,
      requesterUid: requestData.requesterUid,
      donorUid,
      donorDisplayName,
      action,
      declineReason: declineReason || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    if (action === "ACCEPT") {
      // Increment accepted and response counters
      transaction.update(requestRef, {
        acceptedCount: admin.firestore.FieldValue.increment(1),
        responseCount: admin.firestore.FieldValue.increment(1),
        status: "IN_PROGRESS",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Issue atomic Contact Grant
      transaction.set(grantRef, {
        grantId,
        requestId,
        requesterUid: requestData.requesterUid,
        donorUid,
        donorDisplayName,
        donorPhone,
        allowWhatsApp,
        status: "ACTIVE",
        grantedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: requestData.expiresAt
      });

      // Create in-app notification for the requester
      const requesterNotifRef = db.collection("notifications").doc();
      transaction.set(requesterNotifRef, {
        userId: requestData.requesterUid,
        title: "Donor Accepted Your Request!",
        body: `${donorDisplayName} has accepted your blood request for ${requestData.hospitalName}. Contact number is now unlocked.`,
        type: "RESPONSE_ACCEPTED",
        requestId,
        grantId,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        responseId,
        action: "ACCEPT",
        requestId,
        grantCreated: true,
        message: "Thank you! You have accepted this request. Contact details granted to requester."
      };
    } else {
      // DECLINE
      transaction.update(requestRef, {
        responseCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        responseId,
        action: "DECLINE",
        requestId,
        grantCreated: false,
        message: "Request declined."
      };
    }
  });

  return result;
});
