import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import SignedAgreement from "@/app/lib/models/SignedAgreement";
import mongoose from "mongoose";
import { requireAdmin } from "@/app/lib/authServer";

export async function PATCH(req) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { userId, agreementMailedToUser, mitcMailedToUser, kycUpdatedByAdmin, invoiceMailedToUser } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateFields = {};
    if (agreementMailedToUser !== undefined) updateFields.agreementMailedToUser = agreementMailedToUser;
    if (mitcMailedToUser !== undefined) updateFields.mitcMailedToUser = mitcMailedToUser;
    if (kycUpdatedByAdmin !== undefined) updateFields.kycUpdatedByAdmin = kycUpdatedByAdmin;
    if (invoiceMailedToUser !== undefined) updateFields.invoiceMailedToUser = invoiceMailedToUser;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Try to find user by ObjectId first, then by any string id (in case it's a userId string)
    let user;
    if (mongoose.Types.ObjectId.isValid(String(userId))) {
      user = await User.findByIdAndUpdate(
        userId,
        updateFields,
        { new: true, runValidators: false }
      );
    } else {
      // If userId is not a valid ObjectId, it might be stored as string in SignedAgreement
      // Try to find the user through SignedAgreement
      const agreement = await SignedAgreement.findOne({ userId }).lean();
      if (agreement && agreement.clientEmail) {
        user = await User.findOneAndUpdate(
          { email: agreement.clientEmail.toLowerCase() },
          updateFields,
          { new: true, runValidators: false }
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found", userId },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User flags updated successfully",
      user: {
        _id: user._id,
        userId,
        agreementMailedToUser: user.agreementMailedToUser,
        mitcMailedToUser: user.mitcMailedToUser,
        kycUpdatedByAdmin: user.kycUpdatedByAdmin,
        invoiceMailedToUser: user.invoiceMailedToUser,
      },
    });
  } catch (error) {
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.statusCode === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { error: "Failed to update user status", details: error.message },
      { status: 500 }
    );
  }
}
