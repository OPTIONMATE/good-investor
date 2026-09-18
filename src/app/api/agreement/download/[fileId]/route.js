// api/agreement/download/[fileId]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import SignedAgreement from "@/app/lib/models/SignedAgreement";
import User from "@/app/lib/models/User";
import Payment from "@/app/lib/models/Payment";
import { generateCompleteAgreementPDF } from "@/app/lib/generateCompletePDF";
import { computeFinalServiceDate, derivePurchasedDurationDays } from "@/app/lib/planValidity";
import { sendAgreementPDFMail } from "@/app/lib/mailer";
import { markAgreementMailed } from "@/app/lib/agreementMailTracking";
import { requireAuth, userOwnsResource } from "@/app/lib/authServer";
import { isValidObjectId } from "@/app/lib/validators";

export async function GET(req, { params }) {
  try {
    // ✅ SECURITY: Require authentication
    const user = await requireAuth();

    const { fileId } = await params;

    // ✅ SECURITY: Validate ObjectId format
    if (!isValidObjectId(fileId)) {
      return NextResponse.json(
        { error: "Invalid agreement ID" },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch agreement
    const agreement = await SignedAgreement.findById(fileId);

    if (!agreement) {
      return NextResponse.json(
        { error: "Agreement not found" },
        { status: 404 }
      );
    }

    // ✅ SECURITY: IDOR Check - verify ownership
    if (!userOwnsResource(agreement.userId, user.userId, user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Check agreement status
    if (agreement.status !== "SIGNED") {
      return NextResponse.json(
        { error: "Agreement is not in signed state" },
        { status: 400 }
      );
    }

    // Update download tracking
    agreement.downloadCount = (agreement.downloadCount || 0) + 1;
    agreement.lastDownloadedAt = new Date();
    await agreement.save();

    const paymentQuery = { userId: String(agreement.userId || "") };
    if (agreement.signedPlanName) {
      paymentQuery.planName = agreement.signedPlanName;
    }

    const relatedPayment = await Payment.findOne(paymentQuery)
      .sort({ paidAt: -1, createdAt: -1 })
      .lean();

    const planStartDate =
      relatedPayment?.paidAt ||
      agreement.signedTimestamp ||
      new Date();
    const planEndDate = relatedPayment?.expiresAt || undefined;
    const planType =
      relatedPayment?.planType ||
      agreement.signedPlanType ||
      "monthly";
    // Prefer the purchased-validity snapshot (Payment.planDuration) over
    // deriving duration from dates. Date derivation uses ONLY stored
    // historical timestamps (never current Plan config, never "today") and
    // remains as a legacy fallback for records that predate the snapshot.
    const planDuration =
      Number(relatedPayment?.planDuration) > 0
        ? Number(relatedPayment.planDuration)
        : Number(agreement?.signedPlanDuration) > 0
          ? Number(agreement.signedPlanDuration)
          : planEndDate && planStartDate
            ? (derivePurchasedDurationDays(planStartDate, planEndDate) ?? undefined)
            : undefined;

    // Reconstruct a missing end date with the same inclusive calendar-day
    // rule used at purchase: end = start + (duration - 1) days. When a stored
    // end date exists it is used unchanged (read-only; never overwritten).
    const effectivePlanEndDate =
      planEndDate ||
      (planStartDate &&
      Number(planDuration) > 0 &&
      !Number.isNaN(new Date(planStartDate).getTime())
        ? computeFinalServiceDate(new Date(planStartDate), Number(planDuration))
        : undefined);

    // Generate PDF
    let pdfBuffer;
    try {
      pdfBuffer = await generateCompleteAgreementPDF({
        ...agreement.toObject(),
        _id: agreement._id.toString(),
        signedDate: agreement.signedTimestamp
          ? new Date(agreement.signedTimestamp).toLocaleDateString("en-IN")
          : new Date().toLocaleDateString("en-IN"),
        planType,
        planStartDate,
        planEndDate: effectivePlanEndDate,
        planDuration,
      });
    } catch (pdfErr) {
      console.error("PDF generation failed:", pdfErr.message);
      return NextResponse.json(
        { error: "Failed to generate PDF" },
        { status: 500 }
      );
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate PDF" },
        { status: 500 }
      );
    }

    // Send confirmation mail
    const agreementMailTo =
      agreement.clientEmail ||
      (
        await User.findById(agreement.userId).select("email").lean()
      )?.email;

    if (agreementMailTo) {
      await sendAgreementPDFMail({
        to: agreementMailTo,
        pdfBuffer,
        clientName: agreement.clientName || "User",
        clientPan: agreement.clientPan || "",
      });

      // Tracking (primary: THIS SignedAgreement; backward-compat: owner User).
      // Runs only after the mail transport accepted the email; a tracking
      // failure must never break the PDF download, so the helper never throws.
      await markAgreementMailed({
        agreementId: agreement._id,
        mailedTo: agreementMailTo,
        logContext: "AGREEMENT DOWNLOAD",
      });
    }

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="agreement-${fileId}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Agreement download error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: error.statusCode || 500 }
    );
  }
}
