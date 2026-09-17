import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Agreement from "@/app/lib/models/Agreement";
import { requireAdmin } from "@/app/lib/authServer";

export async function GET() {
  try {
    // ✅ SECURITY: Require admin authentication
    await requireAdmin();
    
    await connectDB();
    const agreements = await Agreement.find().sort({ version: -1 });

    return NextResponse.json({ agreements });
  } catch (error) {
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.statusCode === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("AGREEMENT LIST ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch agreements" }, { status: 500 });
  }
}
