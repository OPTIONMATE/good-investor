import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import { requireAuth } from "@/app/lib/authServer";

export async function POST(request) {
  try {
    // ✅ SECURITY: Require authentication to create invoices
    await requireAuth();

    await connectDB();
    const mongoose = (await import("mongoose")).default;
    const Invoice =
      mongoose.models.Invoice ||
      mongoose.model(
        "Invoice",
        new mongoose.Schema({
          clientName: String,
          amount: Number,
          startDate: Date,
          endDate: Date,
          createdAt: { type: Date, default: Date.now },
        }),
      );
    const body = await request.json();
    const { clientName, amount, startDate, endDate } = body;
    const invoice = await Invoice.create({
      clientName,
      amount,
      startDate,
      endDate,
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    if (err.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Invoice creation error:", err);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // ✅ SECURITY: Require authentication to view invoices
    const user = await requireAuth();

    await connectDB();
    const mongoose = (await import("mongoose")).default;
    const Invoice =
      mongoose.models.Invoice ||
      mongoose.model(
        "Invoice",
        new mongoose.Schema({
          clientName: String,
          amount: Number,
          startDate: Date,
          endDate: Date,
          email: String,
          createdAt: { type: Date, default: Date.now },
        }),
      );
    const normalizedEmail = String(user.email || "").trim().toLowerCase();
    const invoiceQuery =
      user.role === "admin"
        ? {}
        : normalizedEmail
          ? { email: normalizedEmail }
          : { _id: null };
    const invoices = await Invoice.find(invoiceQuery).lean();
    return NextResponse.json({ invoices });
  } catch (err) {
    if (err.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Invoice fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
