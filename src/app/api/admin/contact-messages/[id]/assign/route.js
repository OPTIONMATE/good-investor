import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import ContactMessage from "@/app/lib/models/ContactMessage";
import TicketActivity from "@/app/lib/models/TicketActivity";
import { verifyAuth, isAdminUser } from "@/app/lib/auth/tokenUtils";
import { transporter } from "@/app/lib/mailer";

const CONTACT_RECEIVER_EMAIL =
  process.env.CONTACT_RECEIVER_EMAIL || "spkumar.researchanalyst@gmail.com";

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

async function sendAssignmentEmail(ticket, assignedAdminEmail) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Ticket Assigned to You</title>
        </head>
        <body style="font-family: 'DM Sans', Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #3b82f6;">New Ticket Assigned to You</h2>
            <p>A support ticket has been assigned to you.</p>
            
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
              <p><strong>Reference ID:</strong> ${ticket.referenceId}</p>
              <p><strong>From:</strong> ${ticket.name} (${ticket.email})</p>
              <p><strong>Phone:</strong> ${ticket.phone}</p>
              <p><strong>Priority:</strong> <span style="color: ${
                ticket.priority === "high"
                  ? "#dc2626"
                  : ticket.priority === "medium"
                    ? "#f59e0b"
                    : "#10b981"
              }; font-weight: bold;">${ticket.priority.toUpperCase()}</span></p>
              <p><strong>Status:</strong> ${ticket.status.replace("_", " ").toUpperCase()}</p>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap; background: #f9fafb; padding: 10px; border-radius: 4px;">${ticket.message}</p>
            </div>
            
            <p style="margin-top: 20px;">Please login to your admin dashboard to view and manage this ticket.</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: CONTACT_RECEIVER_EMAIL,
      to: assignedAdminEmail,
      subject: `Ticket Assigned - Reference ID: ${ticket.referenceId}`,
      html,
      text: `New Ticket Assigned to You\n\nReference ID: ${ticket.referenceId}\nFrom: ${ticket.name} (${ticket.email})\nPhone: ${ticket.phone}\nPriority: ${ticket.priority.toUpperCase()}\nStatus: ${ticket.status.replace("_", " ").toUpperCase()}\n\nMessage:\n${ticket.message}`,
    });
  } catch (error) {
    console.error("Error sending assignment email:", error);
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

    const { id } = await params;

    await connectDB();
    const { assignedTo } = await req.json();

    // Validate input
    if (!assignedTo || typeof assignedTo !== "string" || assignedTo.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid assignedTo value",
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

    const oldAssignedTo = ticket.assignedTo || "Unassigned";
    ticket.assignedTo = assignedTo.trim();
    await ticket.save();

    // Log activity
    await logActivity(
      id,
      "assign",
      user.email,
      oldAssignedTo,
      assignedTo.trim(),
      `Ticket assigned to ${assignedTo.trim()}`
    );

    // Send assignment email
    await sendAssignmentEmail(ticket, assignedTo.trim());

    return NextResponse.json(
      {
        success: true,
        message: "Ticket assigned successfully",
        data: ticket,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning ticket:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to assign ticket",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
