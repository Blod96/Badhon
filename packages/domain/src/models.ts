import {
  BloodGroup,
  UserRole,
  AffiliationType,
  RequestStatus,
  Urgency,
  ResponseAction,
  GrantStatus,
  ReportCategory,
  ReportStatus,
  AccountStatus
} from "./enums";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  isPhoneVerified: boolean;
  bloodGroup: BloodGroup;
  roles: UserRole[];
  affiliationType: AffiliationType;
  department?: string;
  nwuId?: string;
  affiliationVerified: boolean;
  division: string;
  district: string;
  upazila: string;
  accountStatus: AccountStatus;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface DonorPublicCard {
  uid: string;
  displayName: string;
  bloodGroup: BloodGroup;
  division: string;
  district: string;
  upazila: string;
  affiliationType: AffiliationType;
  isAvailable: boolean;
  isEligible: boolean;
  isPublicVisible: boolean;
  verifiedBadge: boolean;
  updatedAt: string;
}

export interface DonorPrivateProfile {
  uid: string;
  isAvailable: boolean;
  lastDonationDate?: string; // YYYY-MM-DD
  nextEligibleDate?: string; // YYYY-MM-DD
  notifyOnUrgentOnly: boolean;
  allowWhatsApp: boolean;
  donationCount: number;
  updatedAt: string;
}

export interface BloodRequest {
  requestId: string;
  requesterUid: string;
  requesterName: string;
  requesterPhone: string;
  bloodGroup: BloodGroup;
  donorsNeeded: number;
  unitsNeeded: number;
  hospitalName: string;
  hospitalAddress: string;
  division: string;
  district: string;
  upazila: string;
  neededAt: string; // ISO 8601
  urgency: Urgency;
  clinicalDetails?: string;
  status: RequestStatus;
  responseCount: number;
  acceptedCount: number;
  expiresAt: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
}

export interface RequestPublicSummary {
  requestId: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospitalName: string;
  district: string;
  upazila: string;
  urgency: Urgency;
  neededAt: string;
  status: RequestStatus;
  createdAt: string;
  expiresAt: string;
}

export interface RequestResponse {
  responseId: string;
  requestId: string;
  requesterUid: string;
  donorUid: string;
  donorDisplayName: string;
  action: ResponseAction;
  declineReason?: string;
  createdAt: string;
}

export interface ContactGrant {
  grantId: string;
  requestId: string;
  requesterUid: string;
  donorUid: string;
  donorPhone: string;
  allowWhatsApp: boolean;
  status: GrantStatus;
  grantedAt: string;
  revokedAt?: string;
  accessCount: number;
  lastAccessedAt?: string;
}

export interface InAppNotification {
  notificationId: string;
  userId: string;
  type: "MATCH_ALERT" | "DONOR_RESPONDED" | "REQUEST_CLOSED" | "SYSTEM_NOTICE";
  title: string;
  body: string;
  requestId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AbuseReport {
  reportId: string;
  reporterUid: string;
  targetType: "USER" | "REQUEST";
  targetId: string;
  category: ReportCategory;
  details: string;
  status: ReportStatus;
  assignedAdminUid?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  logId: string;
  adminUid: string;
  action: string;
  targetResource: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}
