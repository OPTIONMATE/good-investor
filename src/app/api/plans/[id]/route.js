import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import Plan from "@/app/lib/models/Plan";
import { verifyAuth, isAdminUser } from "@/app/lib/auth/tokenUtils";
import { validatePlanInput, sanitizePlan } from "@/app/lib/validation/planValidation";

/**
 * GET /api/plans/:id
 * Anyone can view plan by ID (but hidden/inactive plans only visible to admin)
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;

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

    const { isValid, user } = await verifyAuth(req);
    const isAdmin = isValid && isAdminUser(user);

    // Fetch plan
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

    // Check if user has permission to view inactive plan
    if (!plan.isActive && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Plan not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: sanitizePlan(plan),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch plan",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/plans/:id
 * Admin only: Update a plan
 */
export async function PUT(req, { params }) {
  try {
    const { id } = await params;

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
          message: "Forbidden: Only admins can update plans",
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

    // Parse request body
    const body = await req.json();
    console.log(`Updating plan ${id}:`, body);

    // Validate input
    const validation = validatePlanInput(body);
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
      name: body.name.trim(),
      type: body.type,
      description: body.description?.trim() || "",
      price: body.price,
      duration: body.duration,
      features: body.features.map((f) => f.trim()).filter(Boolean),
      isActive: body.isActive !== undefined ? body.isActive : true,
      displayOrder: body.displayOrder || 0,
    };

    // Update plan
    const updatedPlan = await Plan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlan) {
      return NextResponse.json(
        {
          success: false,
          message: "Plan not found",
        },
        { status: 404 }
      );
    }

    console.log("Plan updated successfully:", id);

    return NextResponse.json(
      {
        success: true,
        message: "Plan updated successfully",
        data: sanitizePlan(updatedPlan),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update plan",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/plans/:id
 * Admin only: Delete a plan (hard delete)
 */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

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
          message: "Forbidden: Only admins can delete plans",
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

    // Delete plan
    const deletedPlan = await Plan.findByIdAndDelete(id);

    if (!deletedPlan) {
      return NextResponse.json(
        {
          success: false,
          message: "Plan not found",
        },
        { status: 404 }
      );
    }

    console.log("Plan deleted successfully:", id);

    return NextResponse.json(
      {
        success: true,
        message: "Plan deleted successfully",
        data: sanitizePlan(deletedPlan),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete plan",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/plans/:id/status
 * Admin only: Toggle plan active/inactive status
 */
export async function PATCH(req, { params }) {
  try {
    const { id, action } = params;

    // Check if this is a status toggle endpoint
    if (action !== "status") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid endpoint",
        },
        { status: 400 }
      );
    }

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
