import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { requireAdmin } from "@/app/lib/authServer";
import { serializeUsers } from "@/app/lib/serializers";
import { createPerIpRateLimiter } from "@/app/lib/rateLimiter";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    // ✅ SECURITY: Rate limiting for admin endpoints (30 requests per minute)
    const rateLimitCheck = createPerIpRateLimiter(request, 30, 60 * 1000);
    if (rateLimitCheck.limited) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${rateLimitCheck.retryAfter} seconds.` },
        { 
          status: 429,
          headers: { 'Retry-After': rateLimitCheck.retryAfter.toString() }
        }
      );
    }

    // ✅ SECURITY: Require admin authentication
    await requireAdmin();

    await connectDB();

    // Get all users - only safe fields
    const users = await User.find()
      .select("-password -emailOtp -emailOtpExpiry")
      .lean();

    // Get all payments
    let Payment = null;
    try {
      Payment = (await import("@/app/lib/models/Payment"))?.default;
    } catch {}
    let payments = [];
    if (Payment) {
      payments = await Payment.find()
        .select("-razorpay_signature")
        .lean();
    }

    // Get all signed agreements
    let SignedAgreement = null;
    try {
      SignedAgreement = (await import("@/app/lib/models/SignedAgreement"))?.default;
    } catch {}
    let signedAgreements = [];
    if (SignedAgreement) {
      signedAgreements = await SignedAgreement.find()
        .select("-signatureData -clientPan")
        .lean();
    }

    // Get all risk profiles
    let riskProfiles = [];
    try {
      const RiskProfile =
        mongoose.models.RiskProfile ||
        mongoose.model(
          "RiskProfile",
          new mongoose.Schema({
            userId: String,
            username: String,
            email: String,
            answers: Object,
            createdAt: { type: Date, default: Date.now },
          })
        );
      riskProfiles = await RiskProfile.find().lean();
    } catch {}

    // Aggregate all info per user (admin view only)
    const userDetails = users.map((user) => {
      const userPayments = payments.filter(
        (p) => p.email === user.email || p.userId === String(user._id)
      );
      const userAgreements = signedAgreements.filter(
        (a) => a.userId === String(user._id) || a.clientEmail === user.email
      );
      const userRiskProfile = riskProfiles.find(
        (r) => r.userId === String(user._id) || r.email === user.email
      );
      return {
        ...user,
        payments: userPayments,
        signedAgreements: userAgreements,
        riskProfile: userRiskProfile || null,
      };
    });

    return NextResponse.json({ users: userDetails });
  } catch (error) {
    console.error("Admin users error:", error.message);
    return NextResponse.json(
      { error: error.statusCode === 403 ? "Forbidden" : "Something went wrong" },
      { status: error.statusCode || 500 }
    );
  }
}
