import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { sendOtpMail } from "@/app/lib/mailer";
import { isValidEmail, sanitizeString } from "@/app/lib/validators";
import { issueOTP, OTP_PURPOSES } from "@/app/lib/otpService";

// Step 1 of registration: validate inputs, create unverified user, send OTP.
// The user is NOT logged in yet — they must verify OTP first.
export async function POST(req) {
  try {
    const body = await req.json();

    // Extract and validate inputs
    const { email, password, username } = body;

    // Input validation
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, password, and username are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Sanitize username
    const sanitizedUsername = sanitizeString(username);
    if (!sanitizedUsername || sanitizedUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    await connectDB();

    // Check if a VERIFIED user already exists with this email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    let user;
    if (existingUser) {
      // Unverified user re-registering — update their details
      existingUser.password = hash;
      existingUser.username = sanitizedUsername;
      await existingUser.save();
      user = existingUser;
    } else {
      // Create new unverified user
      user = await User.create({
        email: normalizedEmail,
        password: hash,
        username: sanitizedUsername,
        role: "user",
        emailVerified: false,
      });
    }

    // Issue a REGISTRATION OTP (isolated from other OTP purposes).
    const otp = await issueOTP({
      userId: user._id,
      email: normalizedEmail,
      purpose: OTP_PURPOSES.REGISTRATION,
      ttlMinutes: 10, // registration OTPs expire in 10 minutes (unchanged)
    });

    // Send OTP email — await so failures are reported to the user
    try {
      await sendOtpMail({ to: normalizedEmail, otp, username: sanitizedUsername });
    } catch (err) {
      console.error("OTP email sending failed:", err.message);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again or use a different email address." },
        { status: 502 }
      );
    }

    // Return step indicator — frontend switches to OTP entry
    return NextResponse.json({
      step: "otp",
      email: normalizedEmail,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
