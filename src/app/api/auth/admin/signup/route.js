import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { signToken } from "@/app/lib/jwt";
import {
  isValidEmail,
  isValidOTP,
  incrementOTPAttempt,
  resetOTPAttempts,
} from "@/app/lib/validators";
import { serializeAuthUser } from "@/app/lib/serializers";
import { setSecureCookie } from "@/app/lib/apiHelpers";
import { verifyOTP, OTP_PURPOSES } from "@/app/lib/otpService";

export async function POST(req) {
  try {
    const { email, password, otp } = await req.json();

    // Validate all fields
    if (!email || !password || !otp) {
      return NextResponse.json(
        { error: "Email, password, and OTP are required" },
        { status: 400 },
      );
    }

    // Trim and normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedOtp = otp.toString().trim();

    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate password length
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Validate OTP format
    if (!isValidOTP(trimmedOtp)) {
      return NextResponse.json(
        { error: "Invalid OTP format" },
        { status: 400 },
      );
    }

    // ✅ SECURITY: Track OTP verification attempts
    const attemptCheck = incrementOTPAttempt(normalizedEmail);
    if (attemptCheck.blocked) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    }

    await connectDB();

    // Find user with this email and OTP
    const user = await User.findOne({
      email: normalizedEmail,
      role: "admin",
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Verify the ADMIN_SIGNUP OTP (purpose-scoped, single-use)
    const result = await verifyOTP({
      userId: user._id,
      purpose: OTP_PURPOSES.ADMIN_SIGNUP,
      otp: trimmedOtp,
    });

    if (!result.valid) {
      if (result.reason === "expired") {
        return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
      }
      if (result.reason === "attempts_exceeded") {
        return NextResponse.json(
          { error: "Too many attempts. Please try again later." },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with password and clear OTP
    user.password = hashedPassword;
    user.emailOtp = null;
    user.emailOtpExpiry = null;
    user.role = "admin";
    user.emailVerified = true;
    user.authProvider = "email";
    user.lastLoginAt = new Date();
    await user.save();

    // ✅ SECURITY: Clear OTP attempts on successful signup
    resetOTPAttempts(normalizedEmail);

    // Generate JWT token
    const token = signToken(user);

    // Return safe user data
    const res = NextResponse.json({
      message: "Admin account created successfully",
      user: serializeAuthUser(user),
    });

    // Set secure cookie
    setSecureCookie(res, "token", token);
    return res;
  } catch (error) {
    console.error("Admin signup error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
