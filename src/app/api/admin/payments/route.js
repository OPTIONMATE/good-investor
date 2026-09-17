import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/authServer";

export async function GET() {
  try {
    // ✅ SECURITY: Require admin authentication
    await requireAdmin();

    await connectDB();
    const mongoose = (await import("mongoose")).default;
    const Payment =
      mongoose.models.Payment ||
      mongoose.model(
        "Payment",
        new mongoose.Schema({
          name: String,
          email: String,
          phone: String,
          amount: Number,
          paidAt: Date,
          expiresAt: Date,
          createdAt: { type: Date, default: Date.now },
        })
      );

    // Fetch payments - exclude sensitive fields
    const payments = await Payment.find()
      .select("-razorpay_signature -razorpay_key_id")
      .lean();

    // `success` keeps this route in line with the other admin endpoints
    // (e.g. /api/admin/payments-audit) so consumers can rely on one shape.
    return NextResponse.json({ success: true, payments });
  } catch (error) {
    console.error("Admin payments error:", error.message);
    return NextResponse.json(
      { error: error.statusCode === 403 ? "Forbidden" : "Something went wrong" },
      { status: error.statusCode || 500 }
    );
  }
}
