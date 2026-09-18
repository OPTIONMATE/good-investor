// Send agreement PDF as attachment
export async function sendAgreementPDFMail({ to, pdfBuffer, clientName, clientPan, userPan }) {
  const from =
    process.env.MAIL_FROM ||
    process.env.MAIL_USER ||
    "goodinvestor.data1@gmail.com";

  const panDisplay = clientPan ? clientPan : "Not Provided";
  const currentYear = new Date().getFullYear();
  const signedDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ---------- HTML EMAIL ----------
  const html = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:0;font-family:'DM Sans',Arial,sans-serif;">
    <tr>
      <td align="center" style="padding:20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-left:4px solid #9BE749;">
          
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;">
              <h1 style="margin:0 0 6px 0;font-size:32px;color:#111827;font-weight:700;line-height:1.2;">Good Investor</h1>
              <p style="margin:0 0 4px 0;font-size:14px;color:#6b7280;">Eeda Damodara Rao</p>
              <p style="margin:0 0 2px 0;font-size:11px;color:#9B9B9B;text-transform:uppercase;letter-spacing:1.2px;font-weight:600;">SEBI Registered Research Analyst</p>
              <p style="margin:0;font-size:10px;color:#9B9B9B;letter-spacing:0.8px;">Registration No: INH000024967</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:0 32px 28px 32px;">
              
              <!-- Greeting -->
              <p style="font-size:15px;margin:0 0 2px 0;color:#111827;font-weight:600;">Dear ${clientName || "Valued Client"},</p>
              <p style="font-size:13px;color:#6b7280;margin:0 0 24px 0;">PAN: ${panDisplay}</p>

              <!-- Main Message -->
              <h2 style="font-size:18px;margin:0 0 8px 0;color:#111827;font-weight:700;">Service Agreement Executed</h2>
              <p style="font-size:14px;color:#404040;margin:0 0 24px 0;line-height:1.6;">
                Your Service Agreement has been successfully signed and executed. The complete agreement PDF is attached to this email for your records.
              </p>

              <!-- Agreement Details Section -->
              <p style="font-size:13px;font-weight:700;color:#9BE749;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.8px;">Agreement Details</p>
              <div style="margin:0 0 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#6b7280;font-weight:500;">Signed Date</td>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#111827;text-align:right;">${signedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#6b7280;font-weight:500;">Client Name</td>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#111827;text-align:right;">${clientName || "Not Provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#6b7280;font-weight:500;">PAN Number</td>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#111827;text-align:right;">${panDisplay}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;font-size:14px;color:#6b7280;font-weight:500;">Document Type</td>
                    <td style="padding:10px 0;font-size:14px;color:#111827;text-align:right;">Service Agreement</td>
                  </tr>
                </table>
              </div>

              <!-- Important Compliance Points -->
              <p style="font-size:13px;font-weight:700;color:#9BE749;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.8px;">Important Compliance Points</p>
              <ul style="margin:0 0 20px 0;padding-left:18px;font-size:14px;color:#404040;line-height:1.8;">
                <li style="margin-bottom:8px;">Services will be activated only after fulfillment of all regulatory and compliance requirements.</li>
                <li style="margin-bottom:8px;">Ensure all KYC details are accurate and match your official documents.</li>
                <li style="margin-bottom:8px;">Any delay in KYC verification may delay service activation.</li>
                <li style="margin-bottom:8px;">Payments are subject to company policies and applicable regulatory guidelines.</li>
                <li style="margin-bottom:8px;"><strong>Eeda Damodara Rao does not provide any assured or guaranteed returns.</strong></li>
                <li>Investments in securities markets are subject to market risks; please read all related documents carefully before investing.</li>
              </ul>

              <!-- Onboarding Steps -->
              <p style="font-size:13px;font-weight:700;color:#9BE749;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.8px;">Next Steps to Proceed with Onboarding</p>
              <ol style="margin:0 0 24px 0;padding-left:18px;font-size:14px;color:#404040;line-height:1.8;">
                <li style="margin-bottom:8px;">Kindly review the attached agreement carefully.</li>
                <li style="margin-bottom:8px;">Report any errors or discrepancies immediately to <a href="mailto:damu.researchanalyst@gmail.com" style="color:#9BE749;text-decoration:none;font-weight:600;">damu.researchanalyst@gmail.com</a>.</li>
                <li style="margin-bottom:8px;">Complete your subscription payment (if applicable).</li>
                <li>Services will be activated only after successful KYC verification through a SEBI-registered KYC Registration Agency (KRA).</li>
              </ol>

              <!-- SEBI & Contact -->
              <p style="font-size:12px;color:#404040;margin:0 0 12px 0;line-height:1.6;">Eeda Damodara Rao is SEBI Registered Research Analyst (Registration No: INH000024967).</p>
              <p style="font-size:12px;color:#404040;margin:0;line-height:1.6;">Need help? Email <a href="mailto:damu.researchanalyst@gmail.com" style="color:#9BE749;text-decoration:none;font-weight:600;">damu.researchanalyst@gmail.com</a></p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eaeaea;background:#f9fafb;">
              <p style="font-size:11px;color:#9B9B9B;margin:0 0 6px 0;text-align:center;">© ${currentYear} Good Investor | Eeda Damodara Rao, SEBI Registered Research Analyst</p>
              <p style="font-size:11px;color:#9B9B9B;margin:0;text-align:center;">
                <a href="https://www.trademilaan.com/privacy-policy" style="color:#9BE749;text-decoration:none;">Privacy Policy</a> • 
                <a href="https://www.trademilaan.com/terms-and-condition" style="color:#9BE749;text-decoration:none;">Terms & Conditions</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  `;

  const mailOptions = {
    from,
    to,
    cc: "damu.researchanalyst@gmail.com",
    subject: "Your Signed Service Agreement - Good Investor",
    html,
    text: `Dear ${clientName || "Valued Client"},\n\nYour Service Agreement has been successfully signed and executed.\n\nPlease find the complete agreement PDF attached to this email.\n\nPAN: ${panDisplay}\nDate: ${signedDate}\n\nThank you for choosing Good Investor.\n\nRegards,\nEeda Damodara Rao\nSEBI Registered Research Analyst (INH000024967)\ndamu.researchanalyst@gmail.com\n+91 97046 48777`,
    attachments: [
      {
        filename: "agreement.pdf",
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
    replyTo: "damu.researchanalyst@gmail.com",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Agreement PDF mail sent ✅", info);
  } catch (err) {
    console.error("Agreement PDF mail send failed ❌", err);
    if (err && err.response) {
      console.error("Mailer error response:", err.response);
    }
    throw err;
  }
}
import nodemailer from "nodemailer";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";

console.log("MAILER FILE LOADED");

const port = Number(process.env.MAIL_PORT) || 465;

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port,
  secure: port === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  logger: process.env.NODE_ENV === 'development',
  debug: process.env.NODE_ENV === 'development',
});

// Verify SMTP
transporter
  .verify()
  .then(() => console.log("SMTP READY — transporter verified"))
  .catch((err) => console.error("SMTP VERIFY FAILED ❌", err));

export async function sendTermsAndConditionsMail(emailOrOptions, maybeOptions) {
  // Backwards-compatible signature:
  //   sendTermsAndConditionsMail(email)
  //   sendTermsAndConditionsMail(email, { userId })
  //   sendTermsAndConditionsMail({ email, userId })
  // Prefer updating the flag by `_id` when available so email-casing
  // differences (e.g. raw Google profile email vs lowercased storage)
  // cannot cause the flag update to miss the user that triggered the mail.
  let email;
  let userId = null;
  if (emailOrOptions && typeof emailOrOptions === "object") {
    email = emailOrOptions.email;
    userId = emailOrOptions.userId || emailOrOptions.user_id || null;
  } else {
    email = emailOrOptions;
    if (maybeOptions && typeof maybeOptions === "object") {
      userId = maybeOptions.userId || maybeOptions.user_id || null;
    }
  }
  if (!email) throw new Error("Recipient email missing");

  const baseUrl = (
    process.env.APP_URL ||
    process.env.PUBLIC_BASE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const termsUrl = `${baseUrl}/terms-and-condition`;

  const from =
    process.env.MAIL_FROM ||
    process.env.MAIL_USER ||
    "goodinvestor.data1@gmail.com";

  // ---------- HTML EMAIL ----------
  const html = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:0;font-family:'DM Sans',Arial,sans-serif;">
    <tr>
      <td align="center" style="padding:20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-left:4px solid #9BE749;">
          
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;">
              <h1 style="margin:0 0 6px 0;font-size:32px;color:#111827;font-weight:700;line-height:1.2;">Good Investor</h1>
              <p style="margin:0 0 4px 0;font-size:14px;color:#6b7280;">Eeda Damodara Rao</p>
              <p style="margin:0 0 2px 0;font-size:11px;color:#9B9B9B;text-transform:uppercase;letter-spacing:1.2px;font-weight:600;">SEBI Registered Research Analyst</p>
              <p style="margin:0;font-size:10px;color:#9B9B9B;letter-spacing:0.8px;">Registration No: INH000024967</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:0 32px 28px 32px;">
              
              <h2 style="font-size:18px;margin:0 0 8px 0;color:#111827;font-weight:700;">Terms & Conditions</h2>
              <p style="font-size:14px;color:#404040;margin:0 0 24px 0;line-height:1.6;">
                Thank you for signing up. Before using our research services, please review and understand our Terms & Conditions as mandated by SEBI.
              </p>

              <!-- Button -->
              <div style="text-align:center;margin:24px 0;">
                <a href="${termsUrl}" target="_blank"
                  style="background:#9BE749;color:#111827;padding:12px 32px;text-decoration:none;border-radius:4px;font-weight:600;font-size:14px;display:inline-block;">
                  View Full Terms & Conditions
                </a>
              </div>

              <!-- Key Points -->
              <p style="font-size:13px;font-weight:700;color:#9BE749;margin:24px 0 12px 0;text-transform:uppercase;letter-spacing:0.8px;">What You Should Know</p>
              <ul style="font-size:14px;color:#404040;padding-left:18px;margin:0 0 24px 0;line-height:1.7;">
                <li style="margin-bottom:6px;">Research-only platform with no trade execution</li>
                <li style="margin-bottom:6px;">Market risks apply; returns not guaranteed</li>
                <li>AI-based research may have limitations</li>
              </ul>

              <!-- Compliance Notice -->
              <p style="font-size:12px;color:#404040;margin:0;line-height:1.6;">Eeda Damodara Rao is SEBI Registered Research Analyst (Registration No: INH000024967). For grievances, email <a href="mailto:damu.researchanalyst@gmail.com" style="color:#9BE749;text-decoration:none;font-weight:600;">damu.researchanalyst@gmail.com</a> or visit <a href="https://scores.sebi.gov.in/" style="color:#9BE749;text-decoration:none;font-weight:600;">SCORES</a>.</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eaeaea;background:#f9fafb;">
              <p style="font-size:11px;color:#9B9B9B;margin:0 0 6px 0;text-align:center;">© ${new Date().getFullYear()} Good Investor | Eeda Damodara Rao, SEBI Registered Research Analyst</p>
              <p style="font-size:11px;color:#9B9B9B;margin:0;text-align:center;">
                <strong>Disclaimer:</strong> SEBI registration does not guarantee performance or assured returns. Investments are subject to market risks.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  `;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Terms & Conditions – Good Investor",
      html,
      replyTo: "damu.researchanalyst@gmail.com",
    });

    console.log("MAIL SENT ✅", info.messageId);

    // Source of truth: mark MITC mailed only when mail send succeeds.
    await connectDB();
  if (userId) {
      await User.findByIdAndUpdate(userId, { mitcMailedToUser: true }, { new: false });
    } else {
      await User.findOneAndUpdate(
        { email: String(email).toLowerCase().trim() },
        { mitcMailedToUser: true },
        { new: false }
      );
    }

    return info;
  } catch (err) {
    console.error("MAIL SEND FAILED ❌", err);
    throw err;
  }
}

// Send invoice PDF as attachment
export async function sendInvoicePDFMail({ to, pdfBuffer, clientName, email, phone, planName, amount, clientPan }) {
  const from =
    process.env.MAIL_FROM ||
    process.env.MAIL_USER ||
    "goodinvestor.data1@gmail.com";

  const currentYear = new Date().getFullYear();
  const invoiceDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ---------- HTML EMAIL ----------
  const html = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:0;font-family:'DM Sans',Arial,sans-serif;">
    <tr>
      <td align="center" style="padding:20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-left:4px solid #9BE749;">
          
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;">
              <h1 style="margin:0 0 6px 0;font-size:32px;color:#111827;font-weight:700;line-height:1.2;">Good Investor</h1>
              <p style="margin:0 0 4px 0;font-size:14px;color:#6b7280;">Eeda Damodara Rao</p>
              <p style="margin:0 0 2px 0;font-size:11px;color:#9B9B9B;text-transform:uppercase;letter-spacing:1.2px;font-weight:600;">SEBI Registered Research Analyst</p>
              <p style="margin:0;font-size:10px;color:#9B9B9B;letter-spacing:0.8px;">Registration No: INH000024967</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:0 32px 28px 32px;">
              
              <!-- Greeting -->
              <p style="font-size:13px;margin:0 0 2px 0;color:#111827;font-weight:600;">Dear Sir/Madam,</p>
              <p style="font-size:13px;color:#6b7280;margin:0 0 16px 0;">Greetings from Good Investor (Eeda Damodara Rao).</p>

              <!-- Main Message -->
              <h2 style="font-size:16px;margin:0 0 8px 0;color:#111827;font-weight:700;">Your subscription has been successfully initiated.</h2>
              <p style="font-size:13px;color:#404040;margin:0 0 16px 0;line-height:1.6;">Please find the attached invoice for your records and taxation purposes.</p>

              <!-- Important Notes -->
              <p style="font-size:13px;font-weight:700;color:#9BE749;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.8px;">Kindly Note the Following:</p>
              <ul style="margin:0 0 20px 0;padding-left:18px;font-size:14px;color:#404040;line-height:1.8;list-style-type:disc;">
                <li style="margin-bottom:8px;">Your services will be activated only after successful KYC verification through a SEBI-registered KYC Registration Agency (KRA).</li>
                <li style="margin-bottom:8px;">Post verification, you may access research recommendations through the designated platform.</li>
                <li style="margin-bottom:8px;">Please retain the attached invoice for your records and taxation purposes.</li>
                <li>In case of any discrepancies in the invoice or subscription details, kindly report the same to us at the earliest.</li>
              </ul>

              <!-- Invoice Details Section -->
              <p style="font-size:13px;font-weight:700;color:#9BE749;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.8px;">Invoice Details</p>
              <div style="margin:0 0 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#6b7280;font-weight:500;">Invoice Date</td>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#111827;text-align:right;">${invoiceDate}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#6b7280;font-weight:500;">Client Name</td>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#111827;text-align:right;">${clientName || "Not Provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#6b7280;font-weight:500;">PAN Card Number</td>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#111827;text-align:right;">${clientPan || "Not Provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#6b7280;font-weight:500;">Service/Plan</td>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#111827;text-align:right;">${planName || "Subscription Service"}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#6b7280;font-weight:500;">Amount Paid</td>
                    <td style="padding:10px 0;border-bottom:1px solid #eaeaea;font-size:14px;color:#111827;text-align:right;font-weight:600;">Rs. ${amount}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;font-size:14px;color:#6b7280;font-weight:500;">Contact</td>
                    <td style="padding:10px 0;font-size:14px;color:#111827;text-align:right;">+91 ${phone}</td>
                  </tr>
                </table>
              </div>

              <!-- Compliance Disclosure -->
              <p style="font-size:13px;font-weight:700;color:#9BE749;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.8px;">Compliance Disclosure:</p>
              <p style="font-size:14px;color:#404040;margin:0 0 12px 0;line-height:1.6;">Mr. Eeda Damodara Rao is a SEBI Registered Research Analyst (Registration No: INH000024967). For Disclaimers and Disclosure please visit <a href="https://www.trademilaan.in" style="color:#9BE749;text-decoration:none;font-weight:600;">www.trademilaan.in</a></p>

              <!-- Support Contact -->
              <p style="font-size:14px;color:#404040;margin:0;line-height:1.6;">For any assistance, feel free to contact our support team at <a href="tel:9704648777" style="color:#9BE749;text-decoration:none;font-weight:600;">+91-9704648777</a> or <a href="mailto:damu.researchanalyst@gmail.com" style="color:#9BE749;text-decoration:none;font-weight:600;">damu.researchanalyst@gmail.com</a></p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eaeaea;background:#f9fafb;">
              <p style="font-size:11px;color:#9B9B9B;margin:0 0 6px 0;text-align:center;">© ${currentYear} Good Investor | Eeda Damodara Rao, SEBI Registered Research Analyst</p>
              <p style="font-size:11px;color:#9B9B9B;margin:0;text-align:center;">
                <a href="https://www.trademilaan.com/privacy-policy" style="color:#9BE749;text-decoration:none;">Privacy Policy</a> • 
                <a href="https://www.trademilaan.com/terms-and-condition" style="color:#9BE749;text-decoration:none;">Terms & Conditions</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  `;

  const mailOptions = {
    from,
    to: [to, "damu.researchanalyst@gmail.com"],
    subject: "Subscription Initiated - Invoice & Activation Details",
    html,
    text: `Dear Sir/Madam,

Greetings from Good Investor (EEDA DAMODARA RAO).

Your subscription has been successfully initiated.

Please find the attached invoice for your records and taxation purposes.

Kindly Note the Following:

1. Your services will be activated only after successful KYC verification through a SEBI-registered KYC Registration Agency (KRA).
2. Post verification, you may access research recommendations through the designated platform.
3. Please retain the attached invoice for your records and taxation purposes.
4. In case of any discrepancies in the invoice or subscription details, kindly report the same to us at the earliest.

Invoice Details:
Invoice Date: ${invoiceDate}
Client Name: ${clientName || "Not Provided"}
Service/Plan: ${planName || "Subscription Service"}
Amount Paid: Rs. ${amount}
Contact: +91 ${phone}

Compliance Disclosure:
Mr. Eeda Damodara Rao is a SEBI Registered Research Analyst (Registration No: INH000024967).
For Disclaimers and Disclosure please visit www.trademilaan.in

For any assistance, feel free to contact our support team at +91-9704648777 or damu.researchanalyst@gmail.com

Regards,
Eeda Damodara Rao
SEBI Registered Research Analyst (INH000024967)`,
    attachments: [
      {
        filename: "invoice.pdf",
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
    replyTo: "damu.researchanalyst@gmail.com",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Invoice PDF mail sent ✅", info);
  } catch (err) {
    console.error("Invoice PDF mail send failed ❌", err);
    if (err && err.response) {
      console.error("Mailer error response:", err.response);
    }
    throw err;
  }
}

export { transporter };

/**
 * Send OTP verification email
 * Matches existing brand style (DM Sans, lime accent, SEBI footer)
 * Includes retry logic for transient SMTP failures (rate limits, network blips)
 */
export async function sendOtpMail({ to, otp, username }) {
  const from =
    process.env.MAIL_FROM ||
    process.env.MAIL_USER ||
    "goodinvestor.data1@gmail.com";

  const currentYear = new Date().getFullYear();

  const html = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:0;font-family:'DM Sans',Arial,sans-serif;">
    <tr>
      <td align="center" style="padding:20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-left:4px solid #9BE749;">

          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;">
              <h1 style="margin:0 0 6px 0;font-size:32px;color:#111827;font-weight:700;line-height:1.2;">Good Investor</h1>
              <p style="margin:0 0 2px 0;font-size:11px;color:#9B9B9B;text-transform:uppercase;letter-spacing:1.2px;font-weight:600;">SEBI Registered Research Analyst</p>
              <p style="margin:0;font-size:10px;color:#9B9B9B;letter-spacing:0.8px;">Registration No: INH000024967</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:0 32px 28px 32px;">

              <h2 style="font-size:18px;margin:0 0 8px 0;color:#111827;font-weight:700;">Verify your email</h2>
              <p style="font-size:14px;color:#404040;margin:0 0 24px 0;line-height:1.6;">
                Welcome${username ? `, ${username}` : ""}! Use the following 6-digit code to complete your registration.
              </p>

              <!-- OTP Code -->
              <div style="background:#f9fafb;border:2px dashed #9BE749;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px 0;">
                <p style="margin:0 0 8px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Your verification code</p>
                <p style="margin:0;font-size:42px;color:#111827;font-weight:700;letter-spacing:8px;font-family:'Courier New',monospace;">${otp}</p>
              </div>

              <p style="font-size:13px;color:#6b7280;margin:0 0 24px 0;line-height:1.6;">
                This code expires in <strong style="color:#111827;">10 minutes</strong>. If you didn't create an account, you can safely ignore this email.
              </p>

              <p style="font-size:13px;color:#404040;margin:0 0 8px 0;line-height:1.6;">Regards,</p>
              <p style="font-size:13px;color:#111827;font-weight:600;margin:0;">Eeda Damodara Rao</p>
              <p style="font-size:11px;color:#9B9B9B;margin:0;">SEBI Registered Research Analyst (INH000024967)</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eaeaea;background:#f9fafb;">
              <p style="font-size:11px;color:#9B9B9B;margin:0 0 6px 0;text-align:center;">${currentYear} Good Investor | Eeda Damodara Rao, SEBI Registered Research Analyst</p>
              <p style="font-size:11px;color:#9B9B9B;margin:0;text-align:center;">
                <a href="https://www.trademilaan.com/privacy-policy" style="color:#9BE749;text-decoration:none;">Privacy Policy</a> •
                <a href="https://www.trademilaan.com/terms-and-condition" style="color:#9BE749;text-decoration:none;">Terms & Conditions</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  `;

  const mailOptions = {
    from,
    to,
    subject: `Your Good Investor verification code: ${otp}`,
    html,
    text: `Welcome${username ? `, ${username}` : ""}!\n\nYour Good Investor verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't create an account, you can safely ignore this email.\n\nRegards,\nEeda Damodara Rao\nSEBI Registered Research Analyst (INH000024967)`,
    replyTo: "damu.researchanalyst@gmail.com",
  };

  // Retry logic: Gmail SMTP can transiently fail (rate limits, network).
  // Retry up to 3 times with exponential backoff for retryable errors.
  const MAX_RETRIES = 3;
  const RETRYABLE_CODES = ["EAI_AGAIN", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "421", "450", "451", "452"];

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`OTP mail sent ✅ (attempt ${attempt})`, info.messageId);
      return;
    } catch (err) {
      const isRetryable =
        RETRYABLE_CODES.some((code) => err.code === code || err.message?.includes(code)) ||
        err.responseCode >= 400 && err.responseCode < 500;
      const isLastAttempt = attempt === MAX_RETRIES;

      console.error(
        `OTP mail send failed ❌ (attempt ${attempt}/${MAX_RETRIES})${isRetryable && !isLastAttempt ? " — retrying..." : ""}`,
        err.message
      );

      if (isLastAttempt || !isRetryable) {
        throw err;
      }

      // Exponential backoff: 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}
