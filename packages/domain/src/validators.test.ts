// ponytail: minimal assert helper to keep domain package free of @types/node dependency
function assertEqual(actual: unknown, expected: unknown, message?: string) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: expected ${expected}, got ${actual}. ${message || ""}`);
  }
}

import {
  normalizeBangladeshiPhone,
  isDonorCooldownPassed,
  computeNextEligibleDate,
  getExpiryHoursForUrgency,
  isValidBloodGroup
} from "./validators";
import { BloodGroup, Urgency } from "./enums";

console.log("▶ Running Badhon Domain & Auth Validator Tests...");

// 1. Bangladeshi Phone Normalization
assertEqual(
  normalizeBangladeshiPhone("01712345678"),
  "+8801712345678",
  "Standard 11-digit number must normalize to E.164"
);
assertEqual(
  normalizeBangladeshiPhone("+8801812345678"),
  "+8801812345678",
  "E.164 number must remain unchanged"
);
assertEqual(
  normalizeBangladeshiPhone("8801912345678"),
  "+8801912345678",
  "880 prefix must normalize to +880"
);
assertEqual(
  normalizeBangladeshiPhone("01712-345678"),
  "+8801712345678",
  "Dashes must be stripped cleanly"
);
assertEqual(
  normalizeBangladeshiPhone("01234567890"),
  null,
  "Invalid BD operator prefix (012) must be rejected"
);
assertEqual(
  normalizeBangladeshiPhone("12345"),
  null,
  "Short number must be rejected"
);
console.log("✓ Bangladeshi phone normalization tests passed.");

// 2. 90-Day Medical Cooldown
const today = new Date();
const ninetyOneDaysAgo = new Date(today.getTime() - 91 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

assertEqual(
  isDonorCooldownPassed(ninetyOneDaysAgo),
  true,
  "Donor who donated 91 days ago must be eligible"
);
assertEqual(
  isDonorCooldownPassed(tenDaysAgo),
  false,
  "Donor who donated 10 days ago must be in cooldown"
);
assertEqual(
  isDonorCooldownPassed(undefined),
  true,
  "First-time donor without last donation date must be eligible"
);
console.log("✓ 90-day cooldown logic tests passed.");

// 3. Urgency Hours
assertEqual(getExpiryHoursForUrgency(Urgency.EMERGENCY), 6);
assertEqual(getExpiryHoursForUrgency(Urgency.URGENT), 24);
assertEqual(getExpiryHoursForUrgency(Urgency.NORMAL), 72);
console.log("✓ Urgency expiration deadlines passed.");

// 4. Blood Group Validity
assertEqual(isValidBloodGroup("B_POSITIVE"), true);
assertEqual(isValidBloodGroup("O_NEGATIVE"), true);
assertEqual(isValidBloodGroup("C_POSITIVE"), false);
console.log("✓ Blood group enum validation tests passed.");

console.log("🎉 All Domain & Auth Validation Tests PASSED successfully!");
