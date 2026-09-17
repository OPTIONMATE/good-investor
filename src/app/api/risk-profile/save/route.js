import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { verifyToken } from "@/app/lib/jwt";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    const { riskProfile } = await req.json();

    if (!riskProfile) {
      return NextResponse.json(
        { message: "Risk profile data is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Debug log
    console.log("Saving risk profile for user:", decoded.id);
    console.log("Risk profile data:", riskProfile);

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { riskProfile },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Also save to RiskProfile collection for admin dashboard
    const mongoose = (await import("mongoose")).default;
    const RiskProfileSchema = new mongoose.Schema({
      userId: String,
      username: String,
      email: String,
      answers: Object,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });
    
    const RiskProfile =
      mongoose.models.RiskProfile ||
      mongoose.model("RiskProfile", RiskProfileSchema);

    // Update or create RiskProfile document
    await RiskProfile.findOneAndUpdate(
      { userId: user._id.toString() },
      {
        userId: user._id.toString(),
        username: user.username || "",
        email: user.email,
        answers: riskProfile,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log("Risk profile saved successfully for user:", user._id);

    return NextResponse.json({
      message: "Risk profile saved successfully",
      user,
    });
  } catch (error) {
    console.error("Error saving risk profile:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
