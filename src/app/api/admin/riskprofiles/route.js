import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { requireAdmin } from "@/app/lib/authServer";

export async function GET() {
  try {
    // ✅ SECURITY: Require admin authentication
    await requireAdmin();
    
    await connectDB();

    const mongoose = (await import("mongoose")).default;
    const RiskProfile =
      mongoose.models.RiskProfile ||
      mongoose.model(
        "RiskProfile",
        new mongoose.Schema({
          userId: String,
          username: String,
          email: String,
          answers: Object,
          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now },
        }),
      );

    // Fetch from RiskProfile collection
    const riskProfilesFromCollection = await RiskProfile.find().lean();

    // Fetch from User model (old risk profiles saved directly in User documents)
    const usersWithRiskProfiles = await User.find(
      { riskProfile: { $exists: true, $ne: null } },
      { 
        _id: 1, 
        username: 1, 
        email: 1, 
        riskProfile: 1, 
        createdAt: 1,
        fullName: 1,
        phone: 1,
        state: 1,
        gender: 1,
        dob: 1,
        panNumber: 1,
      }
    ).lean();

    // Convert User risk profiles to RiskProfile format with additional fields
    const riskProfilesFromUsers = usersWithRiskProfiles.map((user) => ({
      userId: user._id.toString(),
      username: user.username || "",
      email: user.email,
      fullName: user.fullName || "",
      phone: user.phone || "",
      state: user.state || "",
      gender: user.gender || "",
      dob: user.dob || "",
      panNumber: user.panNumber || "",
      answers: user.riskProfile,
      createdAt: user.createdAt || new Date(),
      _id: `user_${user._id}`, // Unique ID to avoid duplicates
    }));

    // Combine and deduplicate by userId
    const allProfiles = [...riskProfilesFromCollection, ...riskProfilesFromUsers];
    const deduplicatedProfiles = [];
    const seenUserIds = new Set();

    for (const profile of allProfiles) {
      if (!seenUserIds.has(profile.userId)) {
        seenUserIds.add(profile.userId);
        deduplicatedProfiles.push(profile);
      }
    }

    // Sort by creation date (newest first)
    deduplicatedProfiles.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    return NextResponse.json({ riskprofiles: deduplicatedProfiles });
  } catch (error) {
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.statusCode === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching risk profiles:", error);
    return NextResponse.json(
      { message: "Error fetching risk profiles" },
      { status: 500 }
    );
  }
}
