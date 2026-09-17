import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { transporter } from "@/app/lib/mailer";
import { isValidPhone } from "@/app/lib/validators";
import { issueOTP, OTP_PURPOSES } from "@/app/lib/otpService";

export async function POST(req) {
  try {
    const { fullName, dob, gender, state, email, phone, panNumber } = await req.json();
    const normalizedPan = String(panNumber || "")
      .toUpperCase()
      .replace(/\s+/g, "")
      .trim();

    // 1. Basic validation
    if (!fullName || !dob || !gender || !state || !email || !phone || !normalizedPan) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    // 2. PAN format validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(normalizedPan)) {
      return NextResponse.json(
        { message: "Invalid PAN format" },
        { status: 400 },
      );
    }

    // 3. Get logged-in user from cookie
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(decoded.id);

    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    // 4. Save details & issue OTP
    user.fullName = fullName;
    user.dob = dob;
    user.gender = gender;
    user.state = state;
    // Normalize phone to digits only (keep country code handling minimal)
    const normalizedPhone = String(phone || "").replace(/\D/g, "").slice(-10);
    if (!isValidPhone(normalizedPhone)) {
      return NextResponse.json({ message: "Invalid phone format" }, { status: 400 });
    }
    user.phone = normalizedPhone;
    // Normalize email
    const normalizedEmail = String(email).trim().toLowerCase();
    // Only update email if it changes and isn't used by another account
    if (normalizedEmail !== (user.email || "").toLowerCase()) {
      const existing = await User.exists({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });
      if (existing) {
        return NextResponse.json(
          { message: "Email already in use by another account" },
          { status: 409 },
        );
      }
      user.email = normalizedEmail;
    }
    user.panNumber = normalizedPan;

    await user.save();

    // 5. Issue a BUY_VERIFICATION OTP (isolated from other OTP purposes)
    const otp = await issueOTP({
      userId: user._id,
      email: user.email,
      purpose: OTP_PURPOSES.BUY_VERIFICATION,
      ttlMinutes: 5, // buy OTPs expire in 5 minutes (unchanged)
    });

    // 6. Send OTP email
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: user.email,
      subject: "Your OTP for Subscription Verification - Trademilaan",
      html: `
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
              
              <h2 style="font-size:18px;margin:0 0 8px 0;color:#111827;font-weight:700;">Secure Verification Required</h2>
              <p style="font-size:14px;color:#404040;margin:0 0 24px 0;line-height:1.6;">Your One-Time Password (OTP) for subscription verification:</p>

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
                  <li>Never share this OTP with anyone</li>
                  <li>We never ask for your OTP via phone or follow-up emails</li>
                  <li>If you did not request this, contact support immediately</li>
                </ul>
              </div>

              <!-- Next Steps -->
              <p style="font-size:14px;color:#404040;margin:0;line-height:1.6;">Enter this OTP on the verification screen to complete your subscription purchase.</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eaeaea;background:#f9fafb;">
              <p style="font-size:12px;color:#9B9B9B;margin:0 0 8px 0;text-align:center;">Need help? Email <a href="mailto:spkumar.researchanalyst@gmail.com" style="color:#9BE749;text-decoration:none;font-weight:600;">spkumar.researchanalyst@gmail.com</a></p>
              <p style="font-size:11px;color:#9B9B9B;margin:0;text-align:center;">© ${new Date().getFullYear()} Trademilaan | Sasikumar Peyyala, SEBI Registered Research Analyst</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  `,
    });

    return NextResponse.json({ message: "OTP sent!" });
  } catch (err) {
    console.error("/api/buy/start error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
