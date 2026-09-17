import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import ContactMessage from "@/app/lib/models/ContactMessage";
import TicketActivity from "@/app/lib/models/TicketActivity";
import { verifyAuth, isAdminUser } from "@/app/lib/auth/tokenUtils";

async function logActivity(ticketId, action, changedBy, oldValue, newValue, description) {
  try {
    await TicketActivity.create({
      ticketId,
      action,
      changedBy,
      oldValue,
      newValue,
      description,
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

export async function PATCH(req, { params }) {
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

    await connectDB();
    const { id } = await params;
    const { priority } = await req.json();

    // Validate priority
    if (!["low", "medium", "high"].includes(priority)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid priority value",
        },
        { status: 400 }
      );
    }

    const ticket = await ContactMessage.findById(id);

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket not found",
        },
        { status: 404 }
      );
    }

    const oldPriority = ticket.priority;
    ticket.priority = priority;
    await ticket.save();

    // Log activity
    await logActivity(
      id,
      "priority_change",
      user.email,
      oldPriority,
      priority,
      `Priority changed from ${oldPriority} to ${priority}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Priority updated successfully",
        data: ticket,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating priority:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update priority",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
