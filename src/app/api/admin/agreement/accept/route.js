import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { requireAdmin } from "@/app/lib/authServer";

export async function POST(req) {
  try {
    // ✅ SECURITY: Require admin role (prevent privilege escalation)
    const user = await requireAdmin();
    
    await connectDB();

    await User.findByIdAndUpdate(user.userId, {
      pdfAccepted: true,
      pdfAcceptedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.statusCode === 403) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }
    
    console.error("Error accepting PDF:", error);
    return NextResponse.json({ error: "Failed to accept PDF" }, { status: 500 });
  }
}
