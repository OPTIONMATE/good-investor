import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import { generateInvoicePDF } from "@/app/lib/generateInvoicePDF";
import Payment from "@/app/lib/models/Payment";
import { requireAuth } from "@/app/lib/authServer";

export async function GET(request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("payment_id")?.trim();

    if (!paymentId || paymentId.length > 255) {
      return new NextResponse("Invalid payment", { status: 400 });
    }

    await connectDB();

    const payment = await Payment.findOne({
      razorpay_payment_id: paymentId,
      paidAt: { $exists: true, $ne: null },
    }).lean();

    if (!payment) {
      return new NextResponse("Payment not found", { status: 404 });
    }

    const normalizedUserEmail = String(user.email || "").trim().toLowerCase();
    const ownsPayment = payment.userId
      ? String(payment.userId) === String(user.userId)
      : normalizedUserEmail &&
        String(payment.email || "").trim().toLowerCase() === normalizedUserEmail;

    if (!ownsPayment) {
      return new NextResponse("Payment not found", { status: 404 });
    }

    const mongoose = (await import("mongoose")).default;
    const InvoiceSchema = new mongoose.Schema({
      clientName: String,
      amount: Number,
      startDate: Date,
      endDate: Date,
      createdAt: { type: Date, default: Date.now },
      email: String,
      phone: String,
      state: String,
      pan: String,
      planId: String,
      planName: String,
      planType: String,
      planDuration: Number,
      razorpay_payment_id: String,
    });
    const Invoice =
      mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
    const invoice = await Invoice.findOne({
      razorpay_payment_id: payment.razorpay_payment_id,
    }).lean();

    if (!invoice) {
      return new NextResponse("Invoice not found", { status: 404 });
    }

    const amount = Number(payment.amount);
    if (!Number.isFinite(amount) || amount <= 0 || invoice.amount !== amount) {
      return new NextResponse("Invalid payment record", { status: 409 });
    }

    const basePrice = Math.round(amount / 1.18);
    const gst = amount - basePrice;
    const invoiceData = {
      clientName: invoice.clientName,
      email: invoice.email,
      mobile: invoice.phone,
      state: invoice.state || "",
      pan: invoice.pan || "",
      service: invoice.planName || payment.planName || "KMR LargeMidCap Services",
      planName: invoice.planName || payment.planName || "",
      price: `Rs. ${basePrice}`,
      qty: "1",
      gst: `Rs. ${gst}`,
      subtotal: `Rs. ${basePrice}`,
      total: `Rs. ${amount}`,
      // Render stored historical dates. For legacy records missing invoice
      // dates, fall back to the stored payment timestamps (never "today").
      startDate: invoice.startDate || payment.paidAt,
      endDate: invoice.endDate || payment.expiresAt,
    };

    const pdfBuffer = await generateInvoicePDF(invoiceData);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${payment.razorpay_payment_id}.pdf`,
      },
    });
  } catch (err) {
    if (err.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.statusCode === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return new NextResponse("Invoice generation failed", { status: 500 });
  }
}
