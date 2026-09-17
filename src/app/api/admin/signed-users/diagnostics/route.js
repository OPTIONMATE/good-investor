import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import SignedAgreement from "@/app/lib/models/SignedAgreement";
import User from "@/app/lib/models/User";
import Payment from "@/app/lib/models/Payment";
import mongoose from "mongoose";
import { requireAdmin } from "@/app/lib/authServer";

/**
 * Diagnostic endpoint to identify data gaps in signed users
 * Use this to understand why certain fields show as "N/A"
 */
export async function GET(req) {
  try {
    await requireAdmin();
    await connectDB();

    // Get all signed agreements
    const signedAgreements = await SignedAgreement.find({})
      .lean()
      .sort({ signedTimestamp: -1 });

    const diagnostics = {
      totalSignedAgreements: signedAgreements.length,
      dataGaps: {
        missingUserRecords: [],
        incompleteUserProfiles: [],
        missingPaymentRecords: [],
        summary: {
          totalWithMissingUserData: 0,
          totalWithIncompleteProfiles: 0,
          totalWithMissingPaymentData: 0,
        },
      },
    };

    // Check each signed agreement
    for (const agreement of signedAgreements) {
      const emailKey = String(agreement.clientEmail || "").toLowerCase().trim();
      
      // Look for matching user
      let user = null;
      if (mongoose.Types.ObjectId.isValid(String(agreement.userId))) {
        user = await User.findById(agreement.userId).lean();
      }
      if (!user && emailKey) {
        user = await User.findOne({ email: emailKey }).lean();
      }

      // Look for matching payment
      let payment = null;
      if (mongoose.Types.ObjectId.isValid(String(agreement.userId))) {
        payment = await Payment.findOne({ userId: agreement.userId }).lean();
      }
      if (!payment && emailKey) {
        payment = await Payment.findOne({ email: emailKey }).lean();
      }

      // Analyze gaps
      if (!user) {
        diagnostics.dataGaps.missingUserRecords.push({
          agreementId: agreement._id,
          clientName: agreement.clientName,
          clientEmail: agreement.clientEmail,
          userId: agreement.userId,
          signedAt: agreement.signedTimestamp,
        });
        diagnostics.dataGaps.summary.totalWithMissingUserData++;
      } else {
        // Check for incomplete user profile
        const incompleteFields = [];
        if (!user.phone) incompleteFields.push("phone");
        if (!user.dob) incompleteFields.push("dob");
        if (!user.state) incompleteFields.push("state");
        if (!user.panNumber) incompleteFields.push("panNumber");
        if (!user.fullName) incompleteFields.push("fullName");

        if (incompleteFields.length > 0) {
          diagnostics.dataGaps.incompleteUserProfiles.push({
            agreementId: agreement._id,
            userId: user._id,
            clientName: agreement.clientName,
            userEmail: user.email,
            missingFields: incompleteFields,
            agreementData: {
              clientName: agreement.clientName,
              clientEmail: agreement.clientEmail,
              clientPan: agreement.clientPan,
            },
            signedAt: agreement.signedTimestamp,
          });
          diagnostics.dataGaps.summary.totalWithIncompleteProfiles++;
        }
      }

      // Check for missing payment
      if (!payment) {
        diagnostics.dataGaps.missingPaymentRecords.push({
          agreementId: agreement._id,
          clientName: agreement.clientName,
          clientEmail: agreement.clientEmail,
          userId: agreement.userId,
          signedAt: agreement.signedTimestamp,
        });
        diagnostics.dataGaps.summary.totalWithMissingPaymentData++;
      }
    }

    // Get recommendations
    const recommendations = [];
    if (diagnostics.dataGaps.summary.totalWithMissingUserData > 0) {
      recommendations.push(
        `${diagnostics.dataGaps.summary.totalWithMissingUserData} signed agreements have no matching User records. These might be test records or data corruption.`
      );
    }
    if (diagnostics.dataGaps.summary.totalWithIncompleteProfiles > 0) {
      recommendations.push(
        `${diagnostics.dataGaps.summary.totalWithIncompleteProfiles} users have incomplete profiles. Consider prompting these users to complete their profiles.`
      );
    }
    if (diagnostics.dataGaps.summary.totalWithMissingPaymentData > 0) {
      recommendations.push(
        `${diagnostics.dataGaps.summary.totalWithMissingPaymentData} signed agreements have no payment records.`
      );
    }

    return NextResponse.json({
      diagnostics,
      recommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.statusCode === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error running diagnostics:", error);
    return NextResponse.json(
      { error: "Failed to run diagnostics", details: error.message },
      { status: 500 }
    );
  }
}
