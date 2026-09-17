import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/authServer";

export async function GET() {
  try {
    // ✅ SECURITY: Require admin authentication
    await requireAdmin();
    
    await connectDB();
  const mongoose = (await import("mongoose")).default;
  const Agreement =
    mongoose.models.Agreement ||
    mongoose.model(
      "Agreement",
      new mongoose.Schema({
        version: Number,
        pdfUrl: String,
        createdAt: { type: Date, default: Date.now },
        cloudinaryPublicId: String,
        isActive: Boolean,
      }),
    );
    const agreements = await Agreement.find().lean();
    return NextResponse.json({ agreements });
  } catch (error) {
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.statusCode === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to fetch agreements" },
      { status: 500 }
    );
  }
}
