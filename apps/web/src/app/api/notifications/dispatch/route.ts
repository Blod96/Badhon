import { NextResponse } from "next/server";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { adminDb, adminMessaging } from "@/lib/firebaseAdmin";
import { getCompatibleDonorGroups, BloodGroup } from "@badhon/domain";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requestId, bloodGroup, hospitalName, district, upazila, urgency } = body;

    if (!requestId || !bloodGroup) {
      return NextResponse.json(
        { error: "requestId and bloodGroup are required" },
        { status: 400 }
      );
    }

    // 1. Calculate medically compatible blood groups
    const compatibleGroups = getCompatibleDonorGroups(bloodGroup as BloodGroup);

    // 2. Query eligible donors who are available and not on cooldown
    const now = Date.now();
    const donorsSnapshot = await adminDb
      .collection("donorPublic")
      .where("isAvailable", "==", true)
      .where("bloodGroup", "in", compatibleGroups.slice(0, 10))
      .limit(50)
      .get();

    const matchedDonorUids = donorsSnapshot.docs
      .filter((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        if (!data.nextEligibleDate) return true;
        const eligibleMs = new Date(data.nextEligibleDate).getTime();
        return eligibleMs <= now;
      })
      .map((doc: QueryDocumentSnapshot) => doc.id);

    if (matchedDonorUids.length === 0) {
      return NextResponse.json({
        success: true,
        matchedDonors: 0,
        notificationsSent: 0,
        message: "No active eligible donors found nearby."
      });
    }

    // 3. Fetch device tokens for matched donors
    const tokenDocs = await adminDb
      .collection("deviceTokens")
      .where("userId", "in", matchedDonorUids.slice(0, 30))
      .get();

    const fcmTokens: string[] = [];
    tokenDocs.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      if (data.token) {
        fcmTokens.push(data.token);
      }
    });

    if (fcmTokens.length === 0) {
      return NextResponse.json({
        success: true,
        matchedDonors: matchedDonorUids.length,
        notificationsSent: 0,
        message: "Donors matched, but no active mobile device tokens registered yet."
      });
    }

    // 4. Send privacy-safe FCM Multicast Notification
    const payload = {
      tokens: fcmTokens.slice(0, 50),
      notification: {
        title: `জরুরি রক্তদান প্রয়োজন (${bloodGroup})`,
        body: `${hospitalName || "হাসপাতাল"}, ${district || "খুলনা"} — জরুরি রক্তদাতার আবেদন।`
      },
      data: {
        requestId: String(requestId),
        bloodGroup: String(bloodGroup),
        urgency: String(urgency || "NORMAL"),
        hospitalName: String(hospitalName || ""),
        district: String(district || ""),
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      }
    };

    const response = await adminMessaging.sendEachForMulticast(payload);

    return NextResponse.json({
      success: true,
      matchedDonors: matchedDonorUids.length,
      notificationsSent: response.successCount,
      failureCount: response.failureCount
    });
  } catch (error: any) {
    console.error("[Push Notification API Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dispatch push notification" },
      { status: 500 }
    );
  }
}
