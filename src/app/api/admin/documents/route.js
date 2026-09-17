import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/authServer";

export async function GET() {
  try {
    // ✅ SECURITY: Require admin authentication
    await requireAdmin();
    
    await connectDB();
  const mongoose = (await import("mongoose")).default;
  const Document =
    mongoose.models.Document ||
    mongoose.model(
      "Document",
      new mongoose.Schema({
        filename: String,
        contentType: String,
        size: Number,
        uploadedBy: String,
        secureUrl: String,
        createdAt: { type: Date, default: Date.now },
      }),
    );
    const documents = await Document.find().lean();
    return NextResponse.json({ documents });
  } catch (error) {
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.statusCode === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
