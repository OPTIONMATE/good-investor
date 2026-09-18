import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import SignedAgreement from "@/app/lib/models/SignedAgreement";
import User from "@/app/lib/models/User";
import Payment from "@/app/lib/models/Payment";
import { generateCompleteAgreementPDF } from "@/app/lib/generateCompletePDF";
import { computeFinalServiceDate, derivePurchasedDurationDays } from "@/app/lib/planValidity";
import { sendAgreementPDFMail } from "@/app/lib/mailer";
import { markAgreementMailed } from "@/app/lib/agreementMailTracking";
import { requireAdmin } from "@/app/lib/authServer";
import { isValidObjectId } from "@/app/lib/validators";

export async function POST(req) {
  try {
    // Admin only
    await requireAdmin();

    const body = await req.json();
    const { agreementId } = body || {};

    if (!agreementId) {
      return NextResponse.json({ error: "agreementId is required" }, { status: 400 });
    }

    if (!isValidObjectId(agreementId)) {
      return NextResponse.json({ error: "Invalid agreementId" }, { status: 400 });
    }

    await connectDB();

    const agreement = await SignedAgreement.findById(agreementId).lean();
    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    if (agreement.status !== "SIGNED") {
      return NextResponse.json({ error: "Agreement is not signed" }, { status: 400 });
    }

    // Find related payment to compute plan dates
    const paymentQuery = { userId: String(agreement.userId || "") };
    if (agreement.signedPlanName) paymentQuery.planName = agreement.signedPlanName;

    const relatedPayment = await Payment.findOne(paymentQuery).sort({ paidAt: -1, createdAt: -1 }).lean();

    const planStartDate = relatedPayment?.paidAt || agreement.signedTimestamp || new Date();
    const planEndDate = relatedPayment?.expiresAt || undefined;
    const planType = relatedPayment?.planType || agreement.signedPlanType || "monthly";
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

    // Generate PDF buffer
    const pdfBuffer = await generateCompleteAgreementPDF({
      ...agreement,
      _id: agreement._id.toString(),
      signedDate: agreement.signedTimestamp ? new Date(agreement.signedTimestamp).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"),
      planType,
      planStartDate,
      planEndDate: effectivePlanEndDate,
      planDuration,
    });

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    }

    // Determine recipient email
    let recipientEmail = agreement.clientEmail;
    let user = null;
    if (!recipientEmail && agreement.userId) {
      user = await User.findById(agreement.userId).lean();
      recipientEmail = user?.email || null;
    }

    if (!recipientEmail) {
      return NextResponse.json({ error: "No recipient email found for this agreement" }, { status: 400 });
    }

    // Send email to user and CC to spkumar
    await sendAgreementPDFMail({
      to: recipientEmail,
      pdfBuffer,
      clientName: agreement.clientName || (user && user.fullName) || "User",
      clientPan: agreement.clientPan || (user && user.panNumber) || "",
    });

    // Same tracking semantics as the user download flow: primary record is THIS
    // SignedAgreement; owner User is also maintained for backward compat.
    // Runs only after the mail transport accepted the email.
    const { mailedAt } = await markAgreementMailed({
      agreementId: agreement._id,
      mailedTo: recipientEmail,
      logContext: "SEND AGREEMENT (ADMIN)",
    });

    return NextResponse.json({ success: true, message: "Agreement mailed", agreementMailedAt: mailedAt });
  } catch (err) {
    console.error("Send agreement error:", err);
    return NextResponse.json({ error: err.message || "Failed to send agreement" }, { status: 500 });
  }
}
