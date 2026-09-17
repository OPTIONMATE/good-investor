import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";

export async function POST(req) {
  await connectDB();

  // Read JWT from cookie
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });

  let user;
  try {
    user = verifyToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
  }

  const { signature, signatureType } = await req.json();
  if (!signature || !signatureType)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await User.findByIdAndUpdate(user.id, {
    signature,
    signatureType,
  });

  return NextResponse.json({ success: true });
}
