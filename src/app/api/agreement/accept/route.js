// app/api/agreement/accept/route.js

import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
    }

    await User.findByIdAndUpdate(decoded.id, {
      pdfAccepted: true,
      pdfAcceptedAt: new Date(),
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("ACCEPT ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
