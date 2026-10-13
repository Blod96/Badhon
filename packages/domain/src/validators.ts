import { BloodGroup, Urgency } from "./enums";

/**
 * Validates and normalizes a Bangladeshi phone number to standard E.164 (+8801XXXXXXXXX).
 * Accepts: '01712345678', '+8801712345678', '8801712345678'.
 */
export function normalizeBangladeshiPhone(input: string): string | null {
  const cleaned = input.trim().replace(/[\s-]/g, "");
  const bdRegex = /^(?:\+8801|8801|01)([3-9]\d{8})$/;
  const match = cleaned.match(bdRegex);
  if (!match) {
    return null;
  }
  return `+8801${match[1]}`;
}

/**
 * Calculates whether a donor has completed the 90-day cooldown period.
 */
export function isDonorCooldownPassed(lastDonationDateStr?: string): boolean {
  if (!lastDonationDateStr) {
    return true; // No prior donation recorded
  }
  const lastDate = new Date(lastDonationDateStr);
  if (isNaN(lastDate.getTime())) {
    return true;
  }
  const cooldownMs = 90 * 24 * 60 * 60 * 1000;
  const now = new Date();
  return now.getTime() - lastDate.getTime() >= cooldownMs;
}

/**
 * Calculates the next eligible donation date string (YYYY-MM-DD).
 */
export function computeNextEligibleDate(lastDonationDateStr?: string): string | null {
  if (!lastDonationDateStr) return null;
  const lastDate = new Date(lastDonationDateStr);
  if (isNaN(lastDate.getTime())) return null;
  const nextDate = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);
  return nextDate.toISOString().split("T")[0];
}

/**
 * Computes expiration hours from urgency level.
 */
export function getExpiryHoursForUrgency(urgency: Urgency): number {
  switch (urgency) {
    case Urgency.EMERGENCY:
      return 6;
    case Urgency.URGENT:
      return 24;
    case Urgency.NORMAL:
    default:
      return 72;
  }
}

/**
 * Checks if a string is a valid BloodGroup enum value.
 */
export function isValidBloodGroup(value: string): value is BloodGroup {
  return Object.values(BloodGroup).includes(value as BloodGroup);
}

/**
 * Returns the list of medically compatible donor blood groups for a given recipient.
 */
export function getCompatibleDonorGroups(recipientGroup: BloodGroup): BloodGroup[] {
  switch (recipientGroup) {
    case BloodGroup.O_NEGATIVE:
      return [BloodGroup.O_NEGATIVE];
    case BloodGroup.O_POSITIVE:
      return [BloodGroup.O_POSITIVE, BloodGroup.O_NEGATIVE];
    case BloodGroup.A_NEGATIVE:
      return [BloodGroup.A_NEGATIVE, BloodGroup.O_NEGATIVE];
    case BloodGroup.A_POSITIVE:
      return [BloodGroup.A_POSITIVE, BloodGroup.A_NEGATIVE, BloodGroup.O_POSITIVE, BloodGroup.O_NEGATIVE];
    case BloodGroup.B_NEGATIVE:
      return [BloodGroup.B_NEGATIVE, BloodGroup.O_NEGATIVE];
    case BloodGroup.B_POSITIVE:
      return [BloodGroup.B_POSITIVE, BloodGroup.B_NEGATIVE, BloodGroup.O_POSITIVE, BloodGroup.O_NEGATIVE];
    case BloodGroup.AB_NEGATIVE:
      return [BloodGroup.AB_NEGATIVE, BloodGroup.A_NEGATIVE, BloodGroup.B_NEGATIVE, BloodGroup.O_NEGATIVE];
    case BloodGroup.AB_POSITIVE:
      return [
        BloodGroup.AB_POSITIVE,
        BloodGroup.AB_NEGATIVE,
        BloodGroup.A_POSITIVE,
        BloodGroup.A_NEGATIVE,
        BloodGroup.B_POSITIVE,
        BloodGroup.B_NEGATIVE,
        BloodGroup.O_POSITIVE,
        BloodGroup.O_NEGATIVE
      ];
  }
}

