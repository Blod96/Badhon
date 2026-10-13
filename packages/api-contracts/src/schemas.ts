import { z } from "zod";
import {
  BloodGroup,
  Urgency,
  AffiliationType,
  UserRole,
  ReportCategory
} from "@badhon/domain";

// Enum Zod Schemas
export const BloodGroupSchema = z.nativeEnum(BloodGroup);
export const UrgencySchema = z.nativeEnum(Urgency);
export const AffiliationTypeSchema = z.nativeEnum(AffiliationType);
export const UserRoleSchema = z.nativeEnum(UserRole);
export const ReportCategorySchema = z.nativeEnum(ReportCategory);

// Register User Profile Schema
export const RegisterUserInputSchema = z.object({
  displayName: z.string().min(2).max(60),
  bloodGroup: BloodGroupSchema,
  roles: z.array(UserRoleSchema).min(1),
  affiliationType: AffiliationTypeSchema,
  department: z.string().max(50).optional(),
  nwuId: z.string().max(20).optional(),
  division: z.string().default("Khulna"),
  district: z.string().default("Khulna"),
  upazila: z.string().min(2),
  phoneNumber: z.string().optional()
});
export type RegisterUserInput = z.infer<typeof RegisterUserInputSchema>;

// Create Blood Request Schema
export const CreateBloodRequestInputSchema = z.object({
  bloodGroup: BloodGroupSchema,
  donorsNeeded: z.number().int().min(1).max(10),
  unitsNeeded: z.number().int().min(1).max(10),
  hospitalName: z.string().min(2).max(100),
  hospitalAddress: z.string().min(5).max(150),
  division: z.string().default("Khulna"),
  district: z.string().default("Khulna"),
  upazila: z.string().min(2),
  neededAt: z.string().datetime(), // ISO 8601 string
  urgency: UrgencySchema,
  clinicalDetails: z.string().max(250).optional(),
  idempotencyKey: z.string().uuid().optional()
});
export type CreateBloodRequestInput = z.infer<typeof CreateBloodRequestInputSchema>;

// Update Blood Request Status Schema
export const UpdateBloodRequestStatusInputSchema = z.object({
  requestId: z.string().min(1),
  newStatus: z.enum(["FULFILLED", "CANCELLED"]),
  reason: z.string().max(200).optional()
});
export type UpdateBloodRequestStatusInput = z.infer<typeof UpdateBloodRequestStatusInputSchema>;

// Respond to Request Schema
export const RespondToRequestInputSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(["ACCEPT", "DECLINE"]),
  declineReason: z.string().max(200).optional()
});
export type RespondToRequestInput = z.infer<typeof RespondToRequestInputSchema>;

// Get Authorized Contact Schema
export const GetAuthorizedContactInputSchema = z.object({
  requestId: z.string().min(1),
  donorUid: z.string().min(1)
});
export type GetAuthorizedContactInput = z.infer<typeof GetAuthorizedContactInputSchema>;

// Register Device Token Schema
export const RegisterDeviceTokenInputSchema = z.object({
  token: z.string().min(10),
  platform: z.enum(["android", "web", "ios"]),
  deviceModel: z.string().max(50).optional()
});
export type RegisterDeviceTokenInput = z.infer<typeof RegisterDeviceTokenInputSchema>;

// Submit Abuse Report Schema
export const SubmitReportInputSchema = z.object({
  targetType: z.enum(["USER", "REQUEST"]),
  targetId: z.string().min(1),
  category: ReportCategorySchema,
  details: z.string().min(5).max(500)
});
export type SubmitReportInput = z.infer<typeof SubmitReportInputSchema>;

// Admin Moderate User Schema
export const AdminModerateUserInputSchema = z.object({
  targetUid: z.string().min(1),
  action: z.enum(["SUSPEND", "REACTIVATE"]),
  reason: z.string().min(3).max(250)
});
export type AdminModerateUserInput = z.infer<typeof AdminModerateUserInputSchema>;

// Admin Moderate Request Schema
export const AdminModerateRequestInputSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(["FORCE_CANCEL", "MARK_UNDER_REVIEW", "REINSTATE"]),
  reason: z.string().min(3).max(250)
});
export type AdminModerateRequestInput = z.infer<typeof AdminModerateRequestInputSchema>;

// Admin Assign Role Schema
export const AdminAssignRoleInputSchema = z.object({
  targetUid: z.string().min(1),
  roles: z.object({
    admin: z.boolean().optional(),
    superAdmin: z.boolean().optional()
  }),
  reason: z.string().min(3).max(250)
});
export type AdminAssignRoleInput = z.infer<typeof AdminAssignRoleInputSchema>;
