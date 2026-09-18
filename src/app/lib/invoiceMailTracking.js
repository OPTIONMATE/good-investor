import User from "@/app/lib/models/User";
import { isValidObjectId } from "@/app/lib/validators";

/**
 * Invoice mail tracking helper.
 *
 * Records a successful invoice-PDF email send on the owner User.
 * Call ONLY after `await sendInvoicePDFMail(...)` resolves.
 *
 * - User.invoiceMailedToUser/At is the source of truth (there are no
 *   mailed fields on the inline Invoice schema — tracking is User-level).
 * - User lookup never creates a User and never matches loosely: exact _id
 *   via the auth token first, then exact normalized-email fallback.
 * - Tracking failures are logged and never thrown, so a secondary DB
 *   failure cannot turn an already-sent email into a failed request.
 */
export async function markInvoiceMailed({ userId, mailedTo, logContext = "invoice-mail" }) {
  const mailedAt = new Date();
  const mailUpdate = { invoiceMailedToUser: true, invoiceMailedAt: mailedAt };

  let userTracked = false;
  try {
    if (userId && isValidObjectId(String(userId))) {
      const updatedUser = await User.findByIdAndUpdate(userId, mailUpdate, { new: false });
      userTracked = Boolean(updatedUser);
    }
    if (!userTracked && mailedTo) {
      const normalizedEmail = String(mailedTo).toLowerCase().trim();
      if (normalizedEmail) {
        const updatedByEmail = await User.findOneAndUpdate({ email: normalizedEmail }, mailUpdate, {
          new: false,
        });
        userTracked = Boolean(updatedByEmail);
      }
    }
    if (!userTracked) {
      console.warn(
        `[${logContext}] user tracking skipped: no matching User found (mailedTo ${mailedTo || "unknown"})`
      );
    }
  } catch (userErr) {
    console.error(`[${logContext}] user tracking update failed:`, userErr?.message || userErr);
  }

  return { mailedAt, userTracked };
}

export default markInvoiceMailed;