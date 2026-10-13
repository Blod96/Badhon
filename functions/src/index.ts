import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Phase 5: Blood Requests and Lifecycle Management
export {
  createBloodRequest,
  updateBloodRequestStatus,
  cleanupExpiredRequests,
  syncBloodRequestToPublic
} from "./requests";


// Phase 6: Donor Matching and Notifications Engine
export {
  respondToRequest,
  registerDeviceToken,
  findMatchingDonors,
  dispatchNotificationsForRequest
} from "./notifications";


// Phase 7: Consent-Based Contact Sharing Gateway
export { getAuthorizedContact } from "./contacts";


// Phase 8: Moderation, Reports, Role Assignment, and Audit Logs
export {
  adminModerateUser,
  adminModerateRequest,
  adminAssignRole,
  submitReport
} from "./moderation";


// Phase 4: Public/Private Dual-Document Synchronization Triggers
export { syncUserToDonorPublic, syncDonorPrivateToDonorPublic } from "./syncDonorPublic";

