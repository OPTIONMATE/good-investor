import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import ContactMessage from "@/app/lib/models/ContactMessage";
import { verifyAuth, isAdminUser } from "@/app/lib/auth/tokenUtils";

const resolveMessageId = async (params) => {
  const resolvedParams = await params;
  return typeof resolvedParams?.id === "string"
    ? resolvedParams.id.trim()
    : "";
};

export async function DELETE(req, { params }) {
  try {
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
          message: "Forbidden: Admin access required",
        },
        { status: 403 }
      );
    }

    const id = await resolveMessageId(params);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid message ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await ContactMessage.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Message not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete message",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
