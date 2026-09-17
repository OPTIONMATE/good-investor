import { NextResponse } from "next/server";
import { transporter } from "@/app/lib/mailer";
import connectDB from "@/app/lib/db";
import ContactMessage from "@/app/lib/models/ContactMessage";
import { createPerIpRateLimiter } from "@/app/lib/rateLimiter";

// ✅ SECURITY: Get contact receiver from environment
const CONTACT_RECEIVER_EMAIL =
  process.env.CONTACT_RECEIVER_EMAIL || process.env.MAIL_FROM;

if (!CONTACT_RECEIVER_EMAIL) {
  throw new Error(
    "CONTACT_RECEIVER_EMAIL or MAIL_FROM environment variable is required",
  );
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{8,15}$/;

const SUBJECT_VALUES = ["general", "account", "billing", "feedback", "other"];

const SUBJECT_LABELS = {
  general: "General Inquiry",
  account: "Account Support",
  billing: "Billing & Pricing",
  feedback: "Feedback / Suggestions",
  other: "Other",
};

function sanitizeText(value) {
  return String(value || "").trim();
}

function sanitizePhone(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, 15);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ✅ SECURITY: Get client IP from headers
function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request) {
  try {
    // ✅ SECURITY: Rate limit contact form (5 requests per minute per IP)
    const rateLimitCheck = createPerIpRateLimiter(request, 5, 60 * 1000);
    if (rateLimitCheck.limited) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many requests. Please wait ${rateLimitCheck.retryAfter} seconds before trying again.`,
        },
        {
          status: 429,
          headers: { "Retry-After": rateLimitCheck.retryAfter.toString() },
        },
      );
    }

    const body = await request.json();
    const name = sanitizeText(body?.name);
    const email = sanitizeText(body?.email).toLowerCase();
    const phone = sanitizePhone(body?.phone);
    const rawSubject = sanitizeText(body?.subject).toLowerCase();
    const subject = SUBJECT_VALUES.includes(rawSubject) ? rawSubject : "";
    const subjectLabel = SUBJECT_LABELS[subject] || "";
    const message = sanitizeText(body?.message);
    const website = sanitizeText(body?.website); // Honeypot field

    if (website) {
      return NextResponse.json(
        { success: true, message: "Message sent successfully" },
        { status: 200 },
      );
    }

    const errors = {};

    if (!name || name.length < 2 || name.length > 100) {
      errors.name = "Please enter a valid name";
    }

    if (!email || !EMAIL_REGEX.test(email) || email.length > 120) {
      errors.email = "Please enter a valid email address";
    }

    if (!subject) {
      errors.subject = "Please choose a subject from the dropdown";
    }

    if (!phone || !PHONE_REGEX.test(phone)) {
      errors.phone = "Please enter a valid numeric phone number";
    }

    if (!message || message.length < 10 || message.length > 2000) {
      errors.message = "Message must be between 10 and 2000 characters";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors,
        },
        { status: 400 },
      );
    }

    const submittedAt = new Date();
    const submittedAtLabel = submittedAt.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });

    const referenceId = `CT-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    // ✅ SECURITY: Get client IP for logging
    const clientIp = getClientIp(request);

    await connectDB();

    await ContactMessage.create({
      referenceId,
      name,
      email,
      phone,
      subject,
      message,
      clientIp,
      isRead: false,
    });

    const fromAddress = process.env.MAIL_FROM || process.env.MAIL_USER;
    const receiverMail = escapeHtml(CONTACT_RECEIVER_EMAIL);

    const adminHtml = `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px;font-family:Arial,sans-serif;">
        <tr>
          <td align="center">
            <table width="680" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
              <tr>
                <td style="padding:16px 20px;background:linear-gradient(90deg,#9BE749,#7ed957);color:#111827;font-size:18px;font-weight:700;">
                  New Contact Form Submission
                </td>
              </tr>
              <tr>
                <td style="padding:20px;color:#111827;">
                  <p style="margin:0 0 12px;font-size:14px;color:#4b5563;">A new inquiry has been submitted from the website contact form.</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;width:180px;">Reference ID</td>
                      <td style="padding:10px;border:1px solid #e5e7eb;">${escapeHtml(referenceId)}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Name</td>
                      <td style="padding:10px;border:1px solid #e5e7eb;">${escapeHtml(name)}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Email</td>
                      <td style="padding:10px;border:1px solid #e5e7eb;">${escapeHtml(email)}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Phone</td>
                      <td style="padding:10px;border:1px solid #e5e7eb;">${escapeHtml(phone)}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Subject</td>
                      <td style="padding:10px;border:1px solid #e5e7eb;">${escapeHtml(subjectLabel)}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Submitted At</td>
                      <td style="padding:10px;border:1px solid #e5e7eb;">${escapeHtml(submittedAtLabel)}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Client IP</td>
                      <td style="padding:10px;border:1px solid #e5e7eb;">${escapeHtml(clientIp)}</td>
                    </tr>
                  </table>

                  <div style="margin-top:16px;padding:14px;border:1px solid #e5e7eb;background:#f9fafb;border-radius:8px;">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#111827;">Message</p>
                    <p style="margin:0;white-space:pre-wrap;font-size:14px;line-height:1.6;color:#374151;">${escapeHtml(message)}</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    const adminText = `New contact form message received.\n\nReference ID: ${referenceId}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subjectLabel}\nSubmitted At: ${submittedAtLabel}\nClient IP: ${clientIp}\n\nMessage:\n${message}`;

    const ackHtml = `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px;font-family:Arial,sans-serif;">
        <tr>
          <td align="center">
            <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
              <tr>
                <td style="padding:16px 20px;background:linear-gradient(90deg,#9BE749,#7ed957);color:#111827;font-size:18px;font-weight:700;">
                  We Received Your Message
                </td>
              </tr>
              <tr>
                <td style="padding:20px;color:#111827;">
                  <p style="margin:0 0 10px;font-size:14px;">Dear ${escapeHtml(name)},</p>
                  <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#374151;">
                    Thank you for contacting Trademilaan. Our support team has received your message and will get back to you shortly.
                  </p>
                  <div style="padding:12px;border:1px solid #e5e7eb;background:#f9fafb;border-radius:8px;">
                    <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Reference ID</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#111827;">${escapeHtml(referenceId)}</p>
                  </div>
                  <p style="margin:14px 0 0;font-size:13px;color:#6b7280;">
                    For urgent queries, call <a href="tel:+917702262206" style="color:#15803d;text-decoration:none;font-weight:600;">+91 77022 62206</a>
                    or email <a href="mailto:${receiverMail}" style="color:#15803d;text-decoration:none;font-weight:600;">${receiverMail}</a>.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    const ackText = `Dear ${name},\n\nThank you for contacting Trademilaan.\n\nWe have received your message and will get back to you shortly.\nReference ID: ${referenceId}\n\nFor urgent queries, call +91 77022 62206 or email ${CONTACT_RECEIVER_EMAIL}.`;

    await transporter.sendMail({
      from: fromAddress,
      to: CONTACT_RECEIVER_EMAIL,
      replyTo: email,
      subject: `New Contact Inquiry | ${name} | ${referenceId}`,
      text: adminText,
      html: adminHtml,
    });

    try {
      await transporter.sendMail({
        from: fromAddress,
        to: email,
        replyTo: CONTACT_RECEIVER_EMAIL,
        subject: `We Received Your Message | ${referenceId}`,
        text: ackText,
        html: ackHtml,
      });
    } catch (ackError) {
      console.error("Contact acknowledgment email failed:", ackError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to send message right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
