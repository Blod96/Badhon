import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { isDonorCooldownPassed } from "@badhon/domain";

const db = admin.firestore();

/**
 * Synchronizes sanitized donor data to `donorPublic/{uid}` whenever `users/{uid}`
 * or `donorPrivate/{uid}` changes.
 *
 * CRITICAL PRIVACY INVARIANT:
 * Zero contact info (phone, email, student ID) is ever copied to donorPublic.
 */
async function syncDonorToPublic(uid: string) {
  const userSnap = await db.collection("users").doc(uid).get();
  
  if (!userSnap.exists) {
    // If user document was deleted, remove from public directory
    await db.collection("donorPublic").doc(uid).delete();
    return;
  }

  const userData = userSnap.data() || {};
  const roles: string[] = userData.roles || [];
  const isDonor = roles.includes("DONOR");
  const isSuspended = userData.accountStatus === "SUSPENDED";

  if (!isDonor || isSuspended) {
    // Not a donor or account is suspended -> hide or remove public card
    await db.collection("donorPublic").doc(uid).delete();
    return;
  }

  const donorPrivateSnap = await db.collection("donorPrivate").doc(uid).get();
  const donorPrivateData = donorPrivateSnap.data() || {};

  const isEligible = isDonorCooldownPassed(donorPrivateData.lastDonationDate);
  const isAvailable = donorPrivateData.isAvailable ?? true;
  const isPublicVisible = donorPrivateData.isPublicVisible ?? true;
  const verifiedBadge = Boolean(userData.affiliationVerified && userData.isPhoneVerified);

  // Sanitized public document payload
  const publicPayload = {
    uid,
    displayName: userData.displayName || "Donor",
    bloodGroup: userData.bloodGroup,
    division: userData.division || "Khulna",
    district: userData.district || "Khulna",
    upazila: userData.upazila || "",
    affiliationType: userData.affiliationType || "EXTERNAL",
    isAvailable,
    isEligible,
    isPublicVisible,
    verifiedBadge,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection("donorPublic").doc(uid).set(publicPayload, { merge: true });
}

export const syncUserToDonorPublic = onDocumentWritten("users/{uid}", async (event) => {
  const uid = event.params.uid;
  await syncDonorToPublic(uid);
});

export const syncDonorPrivateToDonorPublic = onDocumentWritten("donorPrivate/{uid}", async (event) => {
  const uid = event.params.uid;
  await syncDonorToPublic(uid);
});
