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
    const { notes } = await req.json();

    // Validate input
    if (notes === null || notes === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Notes cannot be empty",
        },
        { status: 400 }
      );
    }

    const notesText = String(notes).trim();

    if (notesText.length > 3000) {
      return NextResponse.json(
        {
          success: false,
          message: "Notes cannot exceed 3000 characters",
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

    const oldNotes = ticket.notes || "(no notes)";
    ticket.notes = notesText || null;
    await ticket.save();

    // Log activity
    await logActivity(
      id,
      "notes_add",
      user.email,
      oldNotes,
      notesText || "(cleared)",
      `Internal notes updated`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Notes updated successfully",
        data: ticket,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating notes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update notes",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
