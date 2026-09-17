import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import { generateInvoicePDF } from "@/app/lib/generateInvoicePDF";
import { requireAdmin } from "@/app/lib/authServer";
import { isValidObjectId } from "@/app/lib/validators";

export async function POST(req) {
  try {
    // ✅ SECURITY: Require admin authentication
    await requireAdmin();

    const { invoiceId } = await req.json();

    // ✅ SECURITY: Validate ObjectId
    if (!invoiceId || !isValidObjectId(invoiceId)) {
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch the invoice
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

    const invoice = await Invoice.findById(invoiceId).lean();

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Generate invoice PDF from the STORED invoice record.
    // This is a read operation: old invoices keep their historical
    // start/end dates; new invoices use their stored (correct) dates.
    // Never recalculate from today / current Plan.duration.
    const invoiceData = {
      clientName: invoice.clientName,
      email: invoice.email,
      mobile: invoice.phone,
      state: invoice.state || "",
      pan: invoice.pan || "",
      service: invoice.planName || "",
      planName: invoice.planName || "",
      price: `Rs. ${Math.round(invoice.amount / 1.18)}`,
      gst: `Rs. ${invoice.amount - Math.round(invoice.amount / 1.18)}`,
      subtotal: `Rs. ${Math.round(invoice.amount / 1.18)}`,
      total: `Rs. ${invoice.amount}`,
      startDate: invoice.startDate,
      endDate: invoice.endDate,
    };

    const pdfBuffer = await generateInvoicePDF(invoiceData);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate PDF" },
        { status: 500 }
      );
    }

    // Generate filename
    const fileName = `invoice-${invoice.clientName}-${new Date(invoice.createdAt).getTime()}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Admin invoice download error:", error.message);
    return NextResponse.json(
      { error: error.statusCode === 403 ? "Forbidden" : "Something went wrong" },
      { status: error.statusCode || 500 }
    );
  }
}
