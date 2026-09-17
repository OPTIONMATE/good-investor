import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import Coupon from "@/app/lib/models/Coupon";
import { verifyAuth, isAdminUser } from "@/app/lib/auth/tokenUtils";
import { sanitizeCoupon } from "@/app/lib/validation/couponValidation";

const resolveCouponId = async (params) => {
  const resolvedParams = await params;
  return typeof resolvedParams?.id === "string"
    ? resolvedParams.id.trim()
    : "";
};

/**
 * PATCH /api/coupons/:id/status
 * Admin only: Toggle coupon active/inactive status
 */
export async function PATCH(req, { params }) {
  try {
    const id = await resolveCouponId(params);

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
          message: "Forbidden: Only admins can toggle coupon status",
        },
        { status: 403 }
      );
    }

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find coupon
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    // Toggle active status
    coupon.isActive = !coupon.isActive;
    await coupon.save();

    console.log(
      `Coupon status toggled: ${id} -> ${coupon.isActive ? "active" : "inactive"}`
    );

    return NextResponse.json(
      {
        success: true,
        message: `Coupon ${coupon.isActive ? "activated" : "deactivated"} successfully`,
        data: sanitizeCoupon(coupon),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to toggle coupon status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
