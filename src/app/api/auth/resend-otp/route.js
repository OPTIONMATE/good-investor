import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { isValidEmail } from "@/app/lib/validators";
import { sendOtpMail } from "@/app/lib/mailer";
import { issueOTP, findLatestPendingOTP, OTP_PURPOSES } from "@/app/lib/otpService";

// Resend OTP for pending registration (60s cooldown).
export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    await connectDB();

    const user = await User.findOne({ email: normalizedEmail });

    // Don't reveal whether email exists — same response either way
    if (!user) {
      return NextResponse.json({
        message: "If a pending registration exists, a new code has been sent",
      });
    }

    // Already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: "If a pending registration exists, a new code has been sent",
      });
    }

    // 60-second cooldown between resends
    const latestOtp = await findLatestPendingOTP({
      userId: user._id,
      purpose: OTP_PURPOSES.REGISTRATION,
    });
    const lastSent = latestOtp ? latestOtp.createdAt : null;
    if (lastSent && Date.now() - lastSent.getTime() < 60 * 1000) {
      const waitSeconds = Math.ceil(
        (60 * 1000 - (Date.now() - lastSent.getTime())) / 1000
      );
      return NextResponse.json(
        {
          error: `Please wait ${waitSeconds}s before requesting a new code`,
          cooldown: waitSeconds,
        },
        { status: 429 }
      );
    }

    // Generate new OTP (invalidates the previous pending registration OTP)
    const otp = await issueOTP({
      userId: user._id,
      email: normalizedEmail,
      purpose: OTP_PURPOSES.REGISTRATION,
      ttlMinutes: 10, // 10 minutes (unchanged)
    });

    // Send OTP email — await so failures are reported
    try {
      await sendOtpMail({ to: normalizedEmail, otp, username: user.username });
    } catch (err) {
      console.error("OTP resend failed:", err.message);
      return NextResponse.json(
        { error: "Failed to resend verification email. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message: "Verification code resent to your email",
      cooldown: 60,
    });
  } catch (error) {
    console.error("Resend OTP error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}