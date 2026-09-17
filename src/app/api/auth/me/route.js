import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { verifyToken } from "@/app/lib/jwt";
import { serializeAuthUser } from "@/app/lib/serializers";

export async function GET(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const decoded = verifyToken(token);
    await connectDB();
    const user = await User.findById(decoded.id);

    if (user && !user.role) {
      user.role = "user";
      await user.save();
    }

    // ✅ SECURITY: Serialize user data to exclude sensitive fields
    const serialized = serializeAuthUser(user);
    return NextResponse.json({ user: serialized });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
