import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import SignedAgreement from "@/app/lib/models/SignedAgreement";
import Payment from "@/app/lib/models/Payment";
import { generateCompleteAgreementPDF } from "@/app/lib/generateCompletePDF";
import { requireAdmin } from "@/app/lib/authServer";
import { isValidObjectId } from "@/app/lib/validators";
import {
  computeFinalServiceDate,
  derivePurchasedDurationDays,
} from "@/app/lib/planValidity";

export async function POST(req) {
  try {
    // ✅ SECURITY: Require admin authentication
    await requireAdmin();

    const { agreementId } = await req.json();

    // ✅ SECURITY: Validate ObjectId
    if (!agreementId || !isValidObjectId(agreementId)) {
      return NextResponse.json(
        { error: "Invalid agreement ID" },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch the signed agreement
    const agreement = await SignedAgreement.findById(agreementId).lean();

    if (!agreement) {
      return NextResponse.json(
        { error: "Agreement not found" },
        { status: 404 }
      );
    }

    // READ-ONLY historical resolution: prefer stored snapshots
    // (SignedAgreement.signedPlanDuration, then the linked Payment snapshot),
    // then validated derivation from stored timestamps. Never today's date,
    // never the current Plan configuration, never a 30-day default.
    let relatedPayment = null;
    try {
      const paymentQuery = {};
      if (agreement.userId) paymentQuery.userId = String(agreement.userId);
      if (agreement.signedPlanName) {
        paymentQuery.planName = agreement.signedPlanName;
      }
      relatedPayment = await Payment.findOne(paymentQuery)
        .sort({ paidAt: -1, createdAt: -1 })
        .lean();
    } catch {
      relatedPayment = null;
    }
    const planStartDate =
      relatedPayment?.paidAt || agreement.signedTimestamp || undefined;
    const planEndDate = relatedPayment?.expiresAt || undefined;
    const planDuration =
      Number(agreement?.signedPlanDuration) > 0
        ? Number(agreement.signedPlanDuration)
        : Number(relatedPayment?.planDuration) > 0
          ? Number(relatedPayment.planDuration)
          : planEndDate && planStartDate
            ? (derivePurchasedDurationDays(planStartDate, planEndDate) ??
              undefined)
            : undefined;
    // Reconstruct a missing end date with the canonical inclusive rule only;
    // a stored end date is always used unchanged.
    const effectivePlanEndDate =
      planEndDate ||
      (planStartDate &&
      Number(planDuration) > 0 &&
      !Number.isNaN(new Date(planStartDate).getTime())
        ? computeFinalServiceDate(new Date(planStartDate), Number(planDuration))
        : undefined);

    // Generate PDF (renderer only — agreement record dates are never rewritten
    // here except download-count stats below).
    const pdfBuffer = await generateCompleteAgreementPDF({
      ...agreement,
      _id: agreement._id.toString(),
      planType:
        relatedPayment?.planType || agreement.signedPlanType || "monthly",
      planStartDate,
      planEndDate: effectivePlanEndDate,
      planDuration,
      signedDate: agreement.signedTimestamp
        ? new Date(agreement.signedTimestamp).toLocaleDateString("en-IN")
        : new Date().toLocaleDateString("en-IN"),
    });

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate PDF" },
        { status: 500 }
      );
    }

    // Update download stats
    await SignedAgreement.findByIdAndUpdate(agreementId, {
      downloadCount: (agreement.downloadCount || 0) + 1,
      lastDownloadedAt: new Date(),
    });

    // Return PDF
    const fileName = `agreement-${agreement.clientName || "unknown"}-${new Date(agreement.signedTimestamp).getTime()}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Admin agreement download error:", error.message);
    return NextResponse.json(
      { error: error.statusCode === 403 ? "Forbidden" : "Something went wrong" },
      { status: error.statusCode || 500 }
    );
  }
}
