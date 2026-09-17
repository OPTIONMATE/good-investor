import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import Coupon from "@/app/lib/models/Coupon";
import { verifyAuth, isAdminUser } from "@/app/lib/auth/tokenUtils";
import {
  validateCouponInput,
  sanitizeCoupon,
} from "@/app/lib/validation/couponValidation";

const resolveCouponId = async (params) => {
  const resolvedParams = await params;
  return typeof resolvedParams?.id === "string"
    ? resolvedParams.id.trim()
    : "";
};

/**
 * GET /api/coupons/:id
 * Anyone can view coupon by ID (but hidden/inactive coupons only visible to admin)
 */
export async function GET(req, { params }) {
  try {
    const id = await resolveCouponId(params);

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

    // Extract user from token
    const { isValid, user } = await verifyAuth(req);

    // Build query based on user role
    let query = { _id: id };
    if (!isValid || !isAdminUser(user)) {
      // Regular users only see active coupons
      query.isActive = true;
    }

    const coupon = await Coupon.findOne(query).lean();

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: sanitizeCoupon(coupon),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch coupon",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/coupons/:id
 * Admin only: Update a coupon
 */
export async function PUT(req, { params }) {
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
          message: "Forbidden: Only admins can update coupons",
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

    // Parse request body
    const body = await req.json();
    console.log(`Updating coupon ${id}:`, body);

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

    await connectDB();

    // Prepare update data
    const updateData = {
      code: body.code.trim().toUpperCase(),
      discountType: body.discountType,
      discountValue: body.discountValue,
      maxUses: body.maxUses || null,
      expiresAt: body.expiresAt || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
      description: body.description?.trim() || "",
    };

    // Update coupon (don't allow changing usedCount via this endpoint)
    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCoupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    console.log("Coupon updated successfully:", id);

    return NextResponse.json(
      {
        success: true,
        message: "Coupon updated successfully",
        data: sanitizeCoupon(updatedCoupon),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update coupon",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/coupons/:id
 * Admin only: Delete a coupon (hard delete)
 */
export async function DELETE(req, { params }) {
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
          message: "Forbidden: Only admins can delete coupons",
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

    const existingCoupon = await Coupon.findById(id);

    if (!existingCoupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    // Production-safe behavior:
    // Keep history for already-used coupons by archiving instead of hard deleting.
    if ((existingCoupon.usedCount || 0) > 0) {
      existingCoupon.isActive = false;
      await existingCoupon.save();

      return NextResponse.json(
        {
          success: true,
          message:
            "Coupon has usage history, so it was archived (deactivated) instead of being permanently deleted",
          data: sanitizeCoupon(existingCoupon),
          archived: true,
        },
        { status: 200 }
      );
    }

    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        { status: 404 }
      );
    }

    console.log("Coupon deleted successfully:", id);

    return NextResponse.json(
      {
        success: true,
        message: "Coupon deleted successfully",
        data: sanitizeCoupon(deletedCoupon),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete coupon",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
