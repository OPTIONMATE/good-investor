import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import SignedAgreement from "@/app/lib/models/SignedAgreement";
import { requireAdmin } from "@/app/lib/authServer";

export async function GET(req) {
  try {
    // ✅ SECURITY: Require admin authentication
    await requireAdmin();
    
    await connectDB();

    // Get email filter from query params
    const { searchParams } = new URL(req.url);
    const emailFilter = searchParams.get("email");

    let query = {};
    if (emailFilter) {
      // Case-insensitive email search
      query.clientEmail = { $regex: emailFilter, $options: "i" };
    }

    const signedAgreements = await SignedAgreement.find(query)
      .lean()
      .sort({ signedTimestamp: -1 });

    return NextResponse.json({ signedAgreements });
  } catch (error) {
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.statusCode === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching signed agreements:", error);
    return NextResponse.json(
      { error: "Failed to fetch agreements" },
      { status: 500 }
    );
  }
}
