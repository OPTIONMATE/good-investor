// api/agreement/sign-and-store/route.js
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import SignedAgreement from "@/app/lib/models/SignedAgreement";
import Plan from "@/app/lib/models/Plan";
import crypto from "crypto";
import { requireAuth } from "@/app/lib/authServer";
import { isValidObjectId } from "@/app/lib/validators";

export async function POST(req) {
  try {
    // ✅ SECURITY: Require authentication to sign agreements
    const user = await requireAuth();

    await connectDB();
    const {
      agreementHtml,
      userId,
      clientName,
      clientPan,
      clientPhone,
      clientDob,
      clientState,
      signedPlanName,
      signedPlanId,
      signedPlanType,
      signedPlanDuration,
      signatureData,
      signedName,
      signedTimestamp,
      signatureTab,
      clientEmail,
    } = await req.json();

    // Debug log
    console.log("📥 Received signing payload:", {
      agreementHtml: agreementHtml
        ? `✅ present (${agreementHtml.length} chars)`
        : "❌ MISSING - THIS IS THE BUG!",
      userId,
      clientName,
      clientPan,
      clientPhone,
      clientDob,
      clientState,
      signatureData: signatureData ? "✅ present" : "❌ missing",
      signedName,
      signedTimestamp,
      signatureTab,
    });

    // WARN if agreement HTML is missing
    if (!agreementHtml || agreementHtml.length === 0) {
      console.warn(
        "⚠️⚠️⚠️ WARNING: Agreement HTML is missing or empty! The agreement content was not captured.",
      );
    }

    // Validate required fields - userId and signatureData are mandatory
    if (!userId || !signatureData) {
      console.error("Validation failed - missing required fields:", {
        userId: !userId ? "MISSING" : "OK",
        signatureData: !signatureData ? "MISSING" : "OK",
      });
      return NextResponse.json(
        { message: "Missing required signing information" },
        { status: 400 },
      );
    }

    // ✅ SECURITY: Verify user owns the agreement being signed (prevent IDOR)
    if (userId !== user.userId) {
      console.error("Unauthorized attempt to sign agreement for different user:", {
        requestedUserId: userId,
        authenticatedUserId: user.userId,
      });
      return NextResponse.json(
        { message: "Forbidden: Cannot sign agreements for other users" },
        { status: 403 },
      );
    }

    // Note: clientName and clientPan come with defaults from frontend if missing
    console.log("Signing with:", {
      userId,
      clientName: clientName || "Unknown",
      clientPan: clientPan || "NOT_PROVIDED",
    });

    // Check if agreement already signed by this user (for production, allow re-signing in dev)
    // Scoped to user + plan so the same user can hold one signed agreement
    // per plan (renewals / multiple purchases), while re-signing the same plan
    // updates the existing doc instead of creating duplicates.
    const requestedPlanIdForLookup = String(signedPlanId || "").trim();
    const existingAgreementQuery = { userId, status: "SIGNED" };
    if (requestedPlanIdForLookup && isValidObjectId(requestedPlanIdForLookup)) {
      existingAgreementQuery.signedPlanId = requestedPlanIdForLookup;
    }
    const existingAgreement = await SignedAgreement.findOne(existingAgreementQuery);

    // Allow re-signing for development - comment out for production
    if (existingAgreement) {
      console.log(
        "User has existing signed agreement. Allowing re-signing for dev.",
      );
      // Uncomment below to prevent re-signing in production
      // return NextResponse.json(
      //   { message: "Agreement already signed by this user" },
      //   { status: 400 },
      // );
    }

    // ✅ SERVICE-AGREEMENT VALIDITY: the server is authoritative for the
    // purchased duration. Resolve the Plan from MongoDB by the signed plan id
    // (NEVER trust the client-sent signedPlanDuration) and snapshot the
    // trusted DB duration. Invalid/missing durations are rejected — never
    // silently defaulted to 30 days.
    let authoritativePlanDuration = null;
    const requestedPlanId = String(signedPlanId || "").trim();
    if (requestedPlanId) {
      if (!isValidObjectId(requestedPlanId)) {
        return NextResponse.json(
          { message: "Invalid plan selected for agreement" },
          { status: 400 },
        );
      }
      const dbPlan = await Plan.findById(requestedPlanId)
        .select("duration isActive")
        .lean();
      if (!dbPlan || dbPlan.isActive === false) {
        return NextResponse.json(
          { message: "Selected plan is unavailable for agreement" },
          { status: 400 },
        );
      }
      const dbDuration = Number(dbPlan.duration);
      if (!Number.isInteger(dbDuration) || dbDuration <= 0) {
        return NextResponse.json(
          { message: "Selected plan has invalid validity configuration" },
          { status: 400 },
        );
      }
      authoritativePlanDuration = dbDuration;
    }

    // Calculate file hash (SHA-256 of HTML + signature)
    const hashInput = `${agreementHtml}${signatureData}${signedTimestamp}`;
    const fileHash = crypto
      .createHash("sha256")
      .update(hashInput)
      .digest("hex");

    // Get IP address from request
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Prepare agreement data
    const agreementData = {
      userId,
      clientName,
      clientPan,
      clientPhone,
      clientDob,
      clientState,
      signedPlanName,
      signedPlanId,
      signedPlanType,
      // Historical snapshot uses the server-resolved DB duration when the
      // plan could be identified; otherwise preserves a valid client value
      // only as legacy data (never a fabricated 30-day default).
      signedPlanDuration:
        authoritativePlanDuration ??
        (Number(signedPlanDuration) > 0 ? Number(signedPlanDuration) : null),
      agreementHtml,
      signatureData,
      signedName,
      signedTimestamp,
      signatureTab,
      ipAddress,
      fileHash,
      status: "SIGNED",
      updatedAt: new Date(),
      clientEmail,
    };

    // If agreement already exists, update it; otherwise create new.
    // Re-signing the same plan preserves an already-linked paymentId — the
    // exact payment link is only (re)set by POST /api/payment/verify.
    let savedAgreement;
    if (existingAgreement) {
      console.log(
        "Updating existing signed agreement for re-signing in dev mode.",
      );
      const { paymentId: _preservePaymentLink, ...resignAgreementData } = agreementData;
      savedAgreement = await SignedAgreement.findOneAndUpdate(
        { _id: existingAgreement._id },
        resignAgreementData,
        { new: true },
      );
    } else {
      console.log("Creating new signed agreement.");
      const agreementDoc = new SignedAgreement({
        ...agreementData,
        createdAt: new Date(),
      });
      savedAgreement = await agreementDoc.save();
    }

    // Return file ID for secure download
    return NextResponse.json(
      {
        message: "Agreement signed and stored successfully",
        fileId: savedAgreement._id.toString(),
        agreementId: savedAgreement._id,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("SIGN AND STORE ERROR:", err);
    return NextResponse.json(
      { message: "Failed to sign and store agreement", error: err.message },
      { status: 500 },
    );
  }
}
