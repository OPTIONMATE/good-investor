import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/authServer";
import { createPerIpRateLimiter } from "@/app/lib/rateLimiter";

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
    const mongoose = (await import("mongoose")).default;
    
    const InvoiceSchema = new mongoose.Schema({
      clientName: String,
      amount: Number,
      startDate: Date,
      endDate: Date,
      email: String,
      phone: String,
      state: String,
      pan: String,
      planId: String,
      planName: String,
      planType: String,
      planDuration: Number,
      razorpay_payment_id: String,
      createdAt: { type: Date, default: Date.now },
    });

    const Invoice =
      mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);

    // Fetch invoices - exclude sensitive fields
    const invoices = await Invoice.find()
      .select("-pan")
      .lean()
      .sort({ createdAt: -1 });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Admin invoices error:", error.message);
    return NextResponse.json(
      { error: error.statusCode === 403 ? "Forbidden" : "Something went wrong" },
      { status: error.statusCode || 500 }
    );
  }
}
