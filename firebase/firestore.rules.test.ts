import fs from "node:fs";
import path from "node:path";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

async function setup() {
  const rulesPath = path.resolve(__dirname, "firestore.rules");
  const rulesContent = fs.readFileSync(rulesPath, "utf8");

  testEnv = await initializeTestEnvironment({
    projectId: "demo-badhon-rules-test",
    firestore: {
      rules: rulesContent,
      host: "127.0.0.1",
      port: 8080
    }
  });
}

async function runTests() {
  console.log("▶ Initializing Firestore Rules Security Test Suite...");
  await setup();

  try {
    // 1. Setup initial state using admin context (bypasses rules)
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      
      // Seed public & private donors
      await setDoc(doc(db, "donorPublic", "visible_donor"), {
        uid: "visible_donor",
        displayName: "Visible Donor",
        isPublicVisible: true,
        bloodGroup: "O_POSITIVE"
      });

      await setDoc(doc(db, "donorPublic", "hidden_donor"), {
        uid: "hidden_donor",
        displayName: "Hidden Donor",
        isPublicVisible: false,
        bloodGroup: "A_POSITIVE"
      });

      await setDoc(doc(db, "users", "alice"), {
        uid: "alice",
        email: "alice@nwu.edu.bd",
        accountStatus: "ACTIVE",
        affiliationVerified: false
      });

      await setDoc(doc(db, "donorPrivate", "alice"), {
        uid: "alice",
        isAvailable: true,
        lastDonationDate: "2026-01-01"
      });

      await setDoc(doc(db, "contactGrants", "grant_1"), {
        grantId: "grant_1",
        donorPhone: "+8801700000001"
      });

      await setDoc(doc(db, "adminAuditLogs", "log_1"), {
        action: "SUSPEND_USER",
        adminUid: "super_admin"
      });
    });

    console.log("✓ Test seed state initialized.");

    // 2. Unauthenticated Access Controls
    const unauthDb = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(getDoc(doc(unauthDb, "donorPublic", "visible_donor")));
    console.log("✓ Public visible donor card can be read by unauthenticated guest.");

    await assertFails(getDoc(doc(unauthDb, "donorPublic", "hidden_donor")));
    console.log("✓ Hidden donor card is protected from unauthenticated read.");

    await assertFails(setDoc(doc(unauthDb, "donorPublic", "fake_donor"), { isPublicVisible: true }));
    console.log("✓ Direct write to donorPublic by guest is rejected.");

    await assertFails(getDoc(doc(unauthDb, "donorPrivate", "alice")));
    console.log("✓ Unauthenticated read to donorPrivate is rejected.");

    await assertFails(getDoc(doc(unauthDb, "users", "alice")));
    console.log("✓ Unauthenticated read to users is rejected.");

    // 3. Authenticated Ownership & Cross-User Privacy
    const aliceDb = testEnv.authenticatedContext("alice", { email: "alice@nwu.edu.bd" }).firestore();
    const bobDb = testEnv.authenticatedContext("bob", { email: "bob@gmail.com" }).firestore();

    await assertSucceeds(getDoc(doc(aliceDb, "users", "alice")));
    console.log("✓ User Alice can read her own users document.");

    await assertFails(getDoc(doc(bobDb, "users", "alice")));
    console.log("✓ Cross-user read from Bob to Alice's profile is blocked.");

    await assertSucceeds(getDoc(doc(aliceDb, "donorPrivate", "alice")));
    console.log("✓ User Alice can read her own donorPrivate record.");

    await assertFails(getDoc(doc(bobDb, "donorPrivate", "alice")));
    console.log("✓ Cross-user read from Bob to Alice's private record is blocked.");

    await assertFails(setDoc(doc(bobDb, "donorPrivate", "alice"), { isAvailable: false }));
    console.log("✓ Cross-user write from Bob to Alice's private record is blocked.");

    await assertFails(setDoc(doc(aliceDb, "donorPublic", "alice"), { isPublicVisible: true }));
    console.log("✓ Client direct write to donorPublic by authenticated user is blocked.");

    // 4. Prevention of Self-Granting Privileges
    await assertFails(
      setDoc(doc(bobDb, "users", "bob"), {
        uid: "bob",
        email: "bob@gmail.com",
        accountStatus: "ACTIVE",
        affiliationVerified: true // Attacking client trying to self-verify!
      })
    );
    console.log("✓ User Bob cannot self-grant affiliationVerified: true on create.");

    await assertFails(
      updateDoc(doc(aliceDb, "users", "alice"), {
        affiliationVerified: true
      })
    );
    console.log("✓ User Alice cannot escalate privileges via profile update.");

    // 5. Contact Grants Strict Lockdown
    await assertFails(getDoc(doc(aliceDb, "contactGrants", "grant_1")));
    await assertFails(getDoc(doc(bobDb, "contactGrants", "grant_1")));
    console.log("✓ Client direct queries on contactGrants are strictly denied.");

    // 6. Admin and SuperAdmin Custom Claims
    const adminDb = testEnv.authenticatedContext("admin_user", { admin: true }).firestore();
    const superAdminDb = testEnv.authenticatedContext("super_user", { superAdmin: true }).firestore();

    await assertSucceeds(getDoc(doc(adminDb, "users", "alice")));
    console.log("✓ Admin with custom claim can read user profile for moderation.");

    await assertFails(getDoc(doc(adminDb, "adminAuditLogs", "log_1")));
    console.log("✓ Regular Admin without superAdmin claim cannot read audit logs.");

    await assertSucceeds(getDoc(doc(superAdminDb, "adminAuditLogs", "log_1")));
    console.log("✓ Super Admin can read administrative audit logs.");

    console.log("🎉 ALL 12 Firestore Security Rules Test Scenarios PASSED with 100% compliance!");
  } finally {
    await testEnv.cleanup();
  }
}

runTests().catch((err) => {
  console.error("❌ Rules test suite failure:", err);
  process.exit(1);
});
