import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { requireAuth } from "@/app/lib/authServer";
import {
  isValidEmail, 
  isValidPhone, 
  isValidPAN, 
  sanitizeString,
  isValidObjectId 
} from "@/app/lib/validators";
import { normalizeDob, normalizeGender } from "@/app/lib/profileFields";
import { serializeUser } from "@/app/lib/serializers";
import { createPerUserRateLimiter } from "@/app/lib/rateLimiter";

export async function PUT(req) {
  try {
    // ✅ SECURITY: Require authentication
    const user = await requireAuth();
    
    // ✅ SECURITY: Rate limiting per user (max 10 updates per minute)
    const rateLimitCheck = createPerUserRateLimiter(user.userId, 10, 60 * 1000);
    if (rateLimitCheck.limited) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${rateLimitCheck.retryAfter} seconds.` },
        { 
          status: 429,
          headers: { 'Retry-After': rateLimitCheck.retryAfter.toString() }
        }
      );
    }

    // ✅ SECURITY: Validate ObjectId format
    if (!isValidObjectId(user.userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { fullName, phone, dob, gender, state, panNumber } = body;

    // ✅ SECURITY: Validate all inputs
    const errors = {};

    if (fullName !== undefined && fullName !== null) {
      const sanitized = sanitizeString(fullName);
      if (!sanitized || sanitized.length < 2 || sanitized.length > 100) {
        errors.fullName = "Full name must be 2-100 characters";
      }
    }

    if (phone !== undefined && phone !== null) {
      if (!isValidPhone(phone)) {
        errors.phone = "Invalid phone number format";
      }
    }

    if (dob !== undefined && dob !== null) {
      // Basic date validation (normalized to the app-wide yyyy-MM-dd format)
      const normalizedDob = normalizeDob(dob);
      if (!normalizedDob) {
        errors.dob = "Invalid date format";
      } else if (new Date(normalizedDob) > new Date()) {
        // Check if date is not in the future
        errors.dob = "Date of birth cannot be in the future";
      }
    }

    if (gender !== undefined && gender !== null) {
      if (!normalizeGender(gender)) {
        errors.gender = "Invalid gender value";
      }
    }

    if (state !== undefined && state !== null) {
      const sanitized = sanitizeString(state);
      if (!sanitized || sanitized.length < 2 || sanitized.length > 50) {
        errors.state = "State must be 2-50 characters";
      }
    }

    if (panNumber !== undefined && panNumber !== null) {
      const upperPan = String(panNumber).toUpperCase().replace(/\s/g, "");
      if (!isValidPAN(upperPan)) {
        errors.panNumber = "Invalid PAN format";
      }
    }

    // Return validation errors if any
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    await connectDB();

    // ✅ SECURITY: Build update object only with valid data
    const updateData = {};
    if (fullName !== undefined && fullName !== null) {
      updateData.fullName = sanitizeString(fullName);
    }
    if (phone !== undefined && phone !== null) {
      updateData.phone = phone;
    }
    if (dob !== undefined && dob !== null) {
      // Schema stores dob as a String; keep the yyyy-MM-dd format so the
      // profile page and <input type="date"> can render the saved value back.
      updateData.dob = normalizeDob(dob);
    }
    if (gender !== undefined && gender !== null) {
      // Store the canonical label ("Male" | "Female" | "Other") used by the UI
      updateData.gender = normalizeGender(gender);
    }
    if (state !== undefined && state !== null) {
      updateData.state = sanitizeString(state);
    }
    if (panNumber !== undefined && panNumber !== null) {
      updateData.panNumber = String(panNumber).toUpperCase().replace(/\s/g, "");
    }

    // ✅ SECURITY: Ensure user can only update their own profile
    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // ✅ SECURITY: Return serialized user data (exclude sensitive fields)
    return NextResponse.json({
      user: serializeUser(updatedUser)
    });
  } catch (err) {
    console.error("Update profile error:", err.message);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
