import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Coupon from "@/app/lib/models/Coupon";
import { verifyAuth, isAdminUser } from "@/app/lib/auth/tokenUtils";
import {
  validateCouponInput,
  sanitizeCoupon,
} from "@/app/lib/validation/couponValidation";

/**
 * GET /api/coupons
 * Admin: Get all coupons (active + inactive)
 * User: Get only active coupons
 */
export async function GET(req) {
  try {
    await connectDB();

    // Extract user from token
    const { isValid, user, error } = await verifyAuth(req);

    // Build query based on user role
    let query = {};
    if (!isValid || !isAdminUser(user)) {
      // Regular users only see active coupons
      query.isActive = true;
      console.log("Fetching active coupons for user");
    } else {
      // Admins see all coupons
      console.log("Fetching all coupons for admin");
    }

    // Fetch coupons sorted by creation date
    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .lean() // Optimize MongoDB query
      .exec();

    const sanitizedCoupons = coupons.map(sanitizeCoupon);

    return NextResponse.json(
      {
        success: true,
        data: sanitizedCoupons,
        count: sanitizedCoupons.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch coupons",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coupons
 * Admin only: Create a new coupon
 */
export async function POST(req) {
  try {
    // Check authentication and authorization
    const { isValid, user, error: authError } = await verifyAuth(req);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: authError || "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (!isAdminUser(user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only admins can create coupons",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log("Creating coupon with data:", body);

    // Validate input
    const validation = validateCouponInput(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({
      code: body.code.toUpperCase(),
    });
    if (existingCoupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code already exists",
        },
        { status: 409 }
      );
    }

    // Create new coupon
    const newCoupon = await Coupon.create({
      code: body.code.trim().toUpperCase(),
      discountType: body.discountType,
      discountValue: body.discountValue,
      maxUses: body.maxUses || null,
      usedCount: 0,
      expiresAt: body.expiresAt || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
      description: body.description?.trim() || "",
    });

    console.log("Coupon created successfully:", newCoupon._id);

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully",
        data: sanitizeCoupon(newCoupon),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create coupon",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
