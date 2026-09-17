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
        paymentId: String,
        orderId: String,
        signature: String,
        paidAt: { type: Date, default: Date.now },
        expiresAt: Date,
      }),
    );
    const users = await Payment.find().lean();
    return NextResponse.json({ users });
  } catch (error) {
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.statusCode === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
