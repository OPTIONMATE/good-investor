import connectDB from "@/app/lib/db";
import Payment from "@/app/lib/models/Payment";
import { requireAdmin } from "@/app/lib/authServer";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // ✅ SECURITY: Use centralized requireAdmin() instead of inline verification
    await requireAdmin();

    // Connect to database
    await connectDB();

    // Get all payments
    const payments = await Payment.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = payments.length;
    const activeCount = payments.filter((p) => new Date(p.expiresAt) > new Date()).length;

    return NextResponse.json({
      success: true,
      payments: payments || [],
      stats: {
        totalRevenue,
        totalTransactions,
        activeCount,
      },
    });
  } catch (error) {
    // Handle auth errors
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.statusCode === 403) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }
    
    console.error("Error fetching admin payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
