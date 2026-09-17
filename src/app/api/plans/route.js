import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Plan from "@/app/lib/models/Plan";
import { verifyAuth, isAdminUser } from "@/app/lib/auth/tokenUtils";
import { validatePlanInput, sanitizePlan } from "@/app/lib/validation/planValidation";

/**
 * GET /api/plans
 * Admin: Get all plans (active + inactive)
 * User: Get only active plans
 */
export async function GET(req) {
  try {
    await connectDB();

    // Extract user from token
    const { isValid, user, error } = await verifyAuth(req);

    // Build query based on user role
    let query = {};
    if (!isValid || !isAdminUser(user)) {
      // Regular users only see active plans
      query.isActive = true;
      console.log("Fetching active plans for user");
    } else {
      // Admins see all plans
      console.log("Fetching all plans for admin");
    }

    // Fetch plans sorted by display order and creation date
    const plans = await Plan.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean() // Optimize MongoDB query
      .exec();

    const sanitizedPlans = plans.map(sanitizePlan);

    return NextResponse.json(
      {
        success: true,
        data: sanitizedPlans,
        count: sanitizedPlans.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch plans",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/plans
 * Admin only: Create a new plan
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
          message: "Forbidden: Only admins can create plans",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log("Creating plan with data:", body);

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

    // Connect to database
    await connectDB();

    // Create new plan
    const newPlan = await Plan.create({
      name: body.name.trim(),
      type: body.type,
      description: body.description?.trim() || "",
      price: body.price,
      duration: body.duration,
      features: body.features.map((f) => f.trim()).filter(Boolean), // Clean features
      isActive: body.isActive !== undefined ? body.isActive : true,
      displayOrder: body.displayOrder || 0,
    });

    console.log("Plan created successfully:", newPlan._id);

    return NextResponse.json(
      {
        success: true,
        message: "Plan created successfully",
        data: sanitizePlan(newPlan),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create plan",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
