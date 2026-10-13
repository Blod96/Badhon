/**
 * Super Admin Bootstrap Script for Badhon (NWU Blood Connect)
 * 
 * Usage:
 *   npx ts-node scripts/bootstrap-superadmin.ts --email "admin@nwu.edu.bd"
 * Or:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json npx ts-node scripts/bootstrap-superadmin.ts --email "admin@nwu.edu.bd"
 */

import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  // If running locally against the emulator:
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    admin.initializeApp({ projectId: "demo-badhon-local" });
  } else {
    admin.initializeApp();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const emailIndex = args.indexOf("--email");
  const uidIndex = args.indexOf("--uid");

  let targetUser: admin.auth.UserRecord | null = null;

  if (emailIndex !== -1 && args[emailIndex + 1]) {
    const email = args[emailIndex + 1];
    console.log(`[Bootstrap] Looking up user by email: ${email}`);
    try {
      targetUser = await admin.auth().getUserByEmail(email);
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        console.log(`[Bootstrap] User not found. Creating user account for: ${email}`);
        targetUser = await admin.auth().createUser({
          email,
          displayName: "Super Administrator",
          emailVerified: true
        });
      } else {
        throw err;
      }
    }
  } else if (uidIndex !== -1 && args[uidIndex + 1]) {
    const uid = args[uidIndex + 1];
    console.log(`[Bootstrap] Looking up user by UID: ${uid}`);
    targetUser = await admin.auth().getUser(uid);
  } else {
    console.error("Error: Please provide --email <email> or --uid <uid>");
    console.log("Example: npx ts-node scripts/bootstrap-superadmin.ts --email admin@nwu.edu.bd");
    process.exit(1);
  }

  if (!targetUser) {
    console.error("Error: Failed to obtain user record.");
    process.exit(1);
  }

  console.log(`[Bootstrap] Found user UID: ${targetUser.uid}`);
  console.log(`[Bootstrap] Applying Custom Claims: { admin: true, superAdmin: true }`);

  await admin.auth().setCustomUserClaims(targetUser.uid, {
    admin: true,
    superAdmin: true
  });

  // Force token revocation so claims take effect on next token refresh
  await admin.auth().revokeRefreshTokens(targetUser.uid);

  // Write immutable audit log
  const db = admin.firestore();
  await db.collection("adminAuditLogs").add({
    adminUid: "SYSTEM_BOOTSTRAP_CLI",
    action: "BOOTSTRAP_SUPERADMIN_ROLE",
    targetResource: `users/${targetUser.uid}`,
    metadata: {
      email: targetUser.email,
      claimsApplied: { admin: true, superAdmin: true }
    },
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log("✓ Success: Super Admin claims applied successfully!");
  console.log(`✓ Audit log created in adminAuditLogs collection.`);
}

main().catch((err) => {
  console.error("Bootstrap error:", err);
  process.exit(1);
});
