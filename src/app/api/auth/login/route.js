import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { signToken } from "@/app/lib/jwt";
import { isValidEmail, incrementLoginAttempt, resetLoginAttempts, isLoginBlocked } from "@/app/lib/validators";
import { serializeAuthUser } from "@/app/lib/serializers";
import { setSecureCookie } from "@/app/lib/apiHelpers";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length === 0) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // ✅ SECURITY: Check login rate limiting
    if (isLoginBlocked(normalizedEmail)) {
      return NextResponse.json(
        { error: "Account temporarily locked due to too many failed login attempts" },
        { status: 429 }
      );
    }

    await connectDB();

    // Lookup user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.password) {
      // ✅ Track failed attempt
      incrementLoginAttempt(normalizedEmail);
      
      // Generic message - don't reveal user exists
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Ensure role is set
    if (!user.role) {
      user.role = "user";
    }

    // Verify password
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      // ✅ Track failed attempt
      incrementLoginAttempt(normalizedEmail);
      
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ SECURITY: Reject unverified users — they must verify OTP first
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email before logging in",
          needsVerification: true,
          email: normalizedEmail,
        },
        { status: 403 }
      );
    }

    // ✅ SECURITY: Reset login attempts on successful login
    resetLoginAttempts(normalizedEmail);

    // Update login tracking
    user.lastLoginAt = new Date();
    user.authProvider = "email";
    await user.save();

    // Generate token
    const token = signToken(user);

    // Return safe user data
    const res = NextResponse.json({
      user: serializeAuthUser(user),
    });

    // Set secure cookie
    setSecureCookie(res, "token", token);
    return res;
  } catch (error) {
    console.error("Login error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
