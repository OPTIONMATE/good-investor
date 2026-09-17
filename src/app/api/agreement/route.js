// app/api/agreement/route.js

import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Document from "@/app/lib/models/Document";

export async function GET() {
  try {
    await connectDB();

    const doc = await Document.findOne().sort({ createdAt: -1 });

    if (!doc) {
      return NextResponse.json({
        fileUrl: null,
        message: "No PDF found",
      });
    }

    return NextResponse.json({
      fileUrl: doc.secureUrl,
    });

  } catch (err) {
    console.error("AGREEMENT FETCH ERROR:", err);
    return NextResponse.json({
      fileUrl: null,
      message: "Server Error",
    }, { status: 500 });
  }
}
