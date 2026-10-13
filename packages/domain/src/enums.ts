export enum BloodGroup {
  A_POSITIVE = "A_POSITIVE",
  A_NEGATIVE = "A_NEGATIVE",
  B_POSITIVE = "B_POSITIVE",
  B_NEGATIVE = "B_NEGATIVE",
  AB_POSITIVE = "AB_POSITIVE",
  AB_NEGATIVE = "AB_NEGATIVE",
  O_POSITIVE = "O_POSITIVE",
  O_NEGATIVE = "O_NEGATIVE"
}

export const BloodGroupLabels: Record<BloodGroup, string> = {
  [BloodGroup.A_POSITIVE]: "A+",
  [BloodGroup.A_NEGATIVE]: "A-",
  [BloodGroup.B_POSITIVE]: "B+",
  [BloodGroup.B_NEGATIVE]: "B-",
  [BloodGroup.AB_POSITIVE]: "AB+",
  [BloodGroup.AB_NEGATIVE]: "AB-",
  [BloodGroup.O_POSITIVE]: "O+",
  [BloodGroup.O_NEGATIVE]: "O-"
};

export enum UserRole {
  DONOR = "DONOR",
  REQUESTER = "REQUESTER"
}

export enum AffiliationType {
  NWU_MEMBER = "NWU_MEMBER",
  EXTERNAL = "EXTERNAL"
}

export enum RequestStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  FULFILLED = "FULFILLED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  UNDER_REVIEW = "UNDER_REVIEW"
}

export enum Urgency {
  NORMAL = "NORMAL",       // Needed within 24–72 hours
  URGENT = "URGENT",       // Needed within 6–24 hours
  EMERGENCY = "EMERGENCY"  // Immediate need (< 6 hours)
}

export enum ResponseAction {
  ACCEPT = "ACCEPT",
  DECLINE = "DECLINE"
}

export enum GrantStatus {
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED",
  EXPIRED = "EXPIRED"
}

export enum ReportCategory {
  SPAM = "SPAM",
  COMMERCIAL_BROKER = "COMMERCIAL_BROKER",
  HARASSMENT = "HARASSMENT",
  FAKE_REQUEST = "FAKE_REQUEST",
  OTHER = "OTHER"
}

export enum ReportStatus {
  PENDING = "PENDING",
  INVESTIGATING = "INVESTIGATING",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED"
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED"
}
