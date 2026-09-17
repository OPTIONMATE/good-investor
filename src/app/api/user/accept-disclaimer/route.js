import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { verifyToken } from "@/app/lib/jwt";

export async function POST(req) {
  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const decoded = verifyToken(token);
  await connectDB();

  const user = await User.findByIdAndUpdate(
    decoded.id,
    { disclaimerAccepted: true },
    { new: true }
  ).select("-password");

  return NextResponse.json({ user });
}
