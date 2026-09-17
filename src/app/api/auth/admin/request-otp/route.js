import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { transporter } from "@/app/lib/mailer";
import {
  isValidEmail,
  incrementOTPAttempt,
  isOTPBlocked,
} from "@/app/lib/validators";
import { issueOTP, removePendingOTPs, OTP_PURPOSES } from "@/app/lib/otpService";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Normalize email (trim and lowercase)
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // ✅ SECURITY: Check OTP rate limiting
    if (isOTPBlocked(normalizedEmail)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    }

    const attemptCheck = incrementOTPAttempt(normalizedEmail);
    if (attemptCheck.blocked) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    }

    await connectDB();

    // ✅ SECURITY: Check if email exists (but don't enumerate)
    const existingUser = await User.findOne({ email: normalizedEmail });

    let user = existingUser;
    if (!user) {
      // Create temporary user document to store signup state
      user = await User.create({
        email: normalizedEmail,
        role: "admin",
        password: null,
      });
    }

    // Issue an ADMIN_SIGNUP OTP (isolated from other OTP purposes)
    const otp = await issueOTP({
      userId: user._id,
      email: normalizedEmail,
      purpose: OTP_PURPOSES.ADMIN_SIGNUP,
      ttlMinutes: 5, // admin OTPs expire in 5 minutes (unchanged)
    });

    // Send OTP Email
    const mailFrom =
      process.env.MAIL_FROM ||
      process.env.MAIL_USER ||
      "noreply@trademilaan.com";

    // ✅ SECURITY: Don't leak internal emails in response
    const internalRecipientEmails = [
      process.env.ADMIN_EMAIL_1 || "admin1@trademilaan.com",
      process.env.ADMIN_EMAIL_2 || "admin2@trademilaan.com",
    ];

    const htmlContent = `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:0;font-family:'DM Sans',Arial,sans-serif;">
        <tr>
          <td align="center" style="padding:20px;">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-left:4px solid #9BE749;">
              
              <!-- Header -->
              <tr>
                <td style="padding:28px 32px;">
                  <h1 style="margin:0 0 6px 0;font-size:32px;color:#111827;font-weight:700;line-height:1.2;">Trademilaan</h1>
                  <p style="margin:0 0 4px 0;font-size:14px;color:#6b7280;">Sasikumar Peyyala</p>
                  <p style="margin:0 0 2px 0;font-size:11px;color:#9B9B9B;text-transform:uppercase;letter-spacing:1.2px;font-weight:600;">SEBI Registered Research Analyst</p>
                  <p style="margin:0;font-size:10px;color:#9B9B9B;letter-spacing:0.8px;">Registration No: INH000019327</p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding:0 32px 28px 32px;">
                  <h2 style="font-size:18px;margin:0 0 8px 0;color:#111827;font-weight:700;">Admin Account Registration</h2>
                  <p style="font-size:14px;color:#404040;margin:0 0 24px 0;line-height:1.6;">Use the OTP below to complete your admin account registration:</p>

                  <!-- OTP Display -->
                  <div style="background:#f9fafb;border:1px solid #eaeaea;padding:28px 24px;margin:0 0 24px 0;text-align:center;">
                    <p style="font-size:12px;color:#9B9B9B;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">One-Time Password</p>
                    <p style="font-size:44px;letter-spacing:8px;color:#111827;font-weight:700;margin:0;font-family:'Courier New',monospace;">
                      ${otp}
                    </p>
                    <p style="font-size:13px;color:#6b7280;margin:12px 0 0 0;">Valid for 5 minutes</p>
                  </div>

                  <!-- Security Notice -->
                  <div style="background:#fff9e6;border-left:2px solid #9BE749;padding:16px 18px;margin:0 0 24px 0;">
                    <p style="font-size:13px;color:#5d4e0f;margin:0 0 10px 0;font-weight:700;">Security Notice</p>
                    <ul style="font-size:13px;color:#5d4e0f;margin:0;padding-left:18px;line-height:1.7;">
                      <li>This OTP is exclusive to you. Do not share it</li>
                      <li>We never ask for your OTP via phone or email</li>
                      <li>If you did not request this, please ignore</li>
                      <li>Only authorized admins can create accounts</li>
                    </ul>
                  </div>

                  <p style="font-size:13px;color:#404040;margin:0;line-height:1.6;">Sasikumar Peyyala is SEBI Registered Research Analyst (Registration No: INH000019327).</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 32px;border-top:1px solid #eaeaea;background:#f9fafb;">
                  <p style="font-size:12px;color:#9B9B9B;margin:0;text-align:center;">© ${new Date().getFullYear()} Trademilaan</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    try {
      await transporter.sendMail({
        from: mailFrom,
        to: normalizedEmail,
        subject: "Admin Account Registration OTP – Trademilaan",
        html: htmlContent,
        replyTo: process.env.ADMIN_REPLY_EMAIL || "admin@trademilaan.com",
      });

      // ✅ SECURITY: Don't disclose internal emails or success details
      return NextResponse.json(
        { message: "OTP has been sent to the registered email address" },
        { status: 200 },
      );
    } catch (mailError) {
      console.error("Failed to send OTP email:", mailError.message);

      // Clean up if email fails — remove any active admin OTP and, if we
      // created the temp user, delete it too.
      await removePendingOTPs({
        userId: user._id,
        purpose: OTP_PURPOSES.ADMIN_SIGNUP,
      });
      if (!existingUser) {
        await User.deleteOne({ email: normalizedEmail });
      }

      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Admin OTP request error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
