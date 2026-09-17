import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import ContactMessage from "@/app/lib/models/ContactMessage";
import TicketActivity from "@/app/lib/models/TicketActivity";
import { verifyAuth, isAdminUser } from "@/app/lib/auth/tokenUtils";
import { transporter } from "@/app/lib/mailer";

const CONTACT_RECEIVER_EMAIL =
  process.env.CONTACT_RECEIVER_EMAIL || "surendrayenika@gmail.com";

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

async function sendResolvedEmail(ticket) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Ticket Resolved</title>
        </head>
        <body style="font-family: 'DM Sans', Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #22c55e;">Your Ticket Has Been Resolved</h2>
            <p>Dear ${ticket.name},</p>
            <p>We're pleased to inform you that your support ticket has been marked as resolved.</p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
              <p><strong>Reference ID:</strong> ${ticket.referenceId}</p>
              <p><strong>Subject:</strong> ${ticket.message.substring(0, 100)}...</p>
              <p><strong>Resolved At:</strong> ${new Date().toLocaleString("en-IN")}</p>
            </div>
            
            <p>If you have any follow-up questions, please reply to this email or contact us at ${CONTACT_RECEIVER_EMAIL}.</p>
            
            <p>Thank you for choosing Trademilaan!</p>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              For support: ${CONTACT_RECEIVER_EMAIL}
            </p>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: CONTACT_RECEIVER_EMAIL,
      to: ticket.email,
      subject: `Ticket Resolved - Reference ID: ${ticket.referenceId}`,
      html,
      text: `Your Ticket Has Been Resolved\n\nDear ${ticket.name},\n\nWe're pleased to inform you that your support ticket has been marked as resolved.\n\nReference ID: ${ticket.referenceId}\nSubject: ${ticket.message.substring(0, 100)}...\n\nIf you have any follow-up questions, please contact us at ${CONTACT_RECEIVER_EMAIL}.\n\nThank you!`,
    });
  } catch (error) {
    console.error("Error sending resolved email:", error);
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
            <p>A new support ticket has been assigned to you.</p>
            
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
              <p><strong>Reference ID:</strong> ${ticket.referenceId}</p>
              <p><strong>From:</strong> ${ticket.name} (${ticket.email})</p>
              <p><strong>Phone:</strong> ${ticket.phone}</p>
              <p><strong>Priority:</strong> ${ticket.priority.toUpperCase()}</p>
              <p><strong>Message:</strong> ${ticket.message}</p>
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
      text: `New Ticket Assigned to You\n\nReference ID: ${ticket.referenceId}\nFrom: ${ticket.name} (${ticket.email})\nPhone: ${ticket.phone}\nPriority: ${ticket.priority.toUpperCase()}\n\nMessage:\n${ticket.message}`,
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

    await connectDB();
    const { id } = await params;
    const { status } = await req.json();

    // Validate status
    if (!["pending", "in_progress", "resolved", "rejected"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status value",
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

    const oldStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    // Log activity
    await logActivity(
      id,
      "status_change",
      user.email,
      oldStatus,
      status,
      `Status changed from ${oldStatus} to ${status}`
    );

    // Send resolved email if status is resolved
    if (status === "resolved") {
      await sendResolvedEmail(ticket);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Status updated successfully",
        data: ticket,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
