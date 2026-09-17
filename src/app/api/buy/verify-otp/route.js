import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { incrementOTPAttempt, resetOTPAttempts } from "@/app/lib/validators";
import { verifyOTP, OTP_PURPOSES } from "@/app/lib/otpService";

export async function POST(req) {
  const { otp } = await req.json();

  if (!otp) {
    return NextResponse.json(
      { message: "OTP is required" },
      { status: 400 }
    );
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  // ✅ SECURITY: Rate limit OTP verification attempts
  const attemptCheck = incrementOTPAttempt(`buy_otp_${decoded.id}`);
  if (attemptCheck.blocked) {
    return NextResponse.json(
      { message: "Too many verification attempts. Please try again later." },
      { status: 429 }
    );
  }

  await connectDB();

  const user = await User.findById(decoded.id);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Verify the BUY_VERIFICATION OTP (purpose-scoped, single-use)
  const result = await verifyOTP({
    userId: user._id,
    purpose: OTP_PURPOSES.BUY_VERIFICATION,
    otp,
  });

  if (!result.valid) {
    if (result.reason === "attempts_exceeded") {
      return NextResponse.json(
        { message: "Too many verification attempts. Please try again later." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { message: "Invalid or expired OTP" },
      { status: 400 }
    );
  }

  // ✅ OTP VERIFIED - Reset rate limit on success
  resetOTPAttempts(`buy_otp_${decoded.id}`);
  
  user.emailOtp = null;
  user.emailOtpExpiry = null;
  user.panVerified = true;

  await user.save();

  return NextResponse.json({
    message: "OTP verified successfully",
  });
}
