import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import Plan from "@/app/lib/models/Plan";
import { verifyAuth, isAdminUser } from "@/app/lib/auth/tokenUtils";
import { sanitizePlan } from "@/app/lib/validation/planValidation";

/**
 * PATCH /api/plans/:id/status
 * Admin only: Toggle plan active/inactive status
 */
export async function PATCH(req, { params }) {
  try {
    const { id } = params;

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
          message: "Forbidden: Only admins can toggle plan status",
        },
        { status: 403 }
      );
    }

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid plan ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find plan and toggle status
    const plan = await Plan.findById(id);

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          message: "Plan not found",
        },
        { status: 404 }
      );
    }

    // Toggle isActive
    plan.isActive = !plan.isActive;
    await plan.save();

    console.log(
      `Plan ${id} status toggled to:`,
      plan.isActive ? "active" : "inactive"
    );

    return NextResponse.json(
      {
        success: true,
        message: `Plan is now ${plan.isActive ? "active" : "inactive"}`,
        data: sanitizePlan(plan),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling plan status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to toggle plan status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
