import SignedAgreement from "@/app/lib/models/SignedAgreement";
import User from "@/app/lib/models/User";
import { isValidObjectId } from "@/app/lib/validators";

/**
 * Agreement mail tracking helper.
 *
 * Records a successful agreement-PDF email send for the EXACT SignedAgreement
 * that produced it. Call ONLY after `await sendAgreementPDFMail(...)` resolves.
 *
 * - SignedAgreement.agreementMailedToUser/At is the primary per-agreement
 *   source of truth, so the fact survives even when the User record is missing.
 * - User.agreementMailedToUser/At is also maintained (same timestamp) for
 *   backward compatibility when the owner User can be found.
 * - User lookup never creates a User and never matches loosely: exact _id via
 *   agreement.userId first, then exact normalized-email fallback.
 * - Tracking failures are logged by the caller context and never thrown, so a
 *   secondary DB failure cannot turn an already-sent email into a failed request.
 */
export async function markAgreementMailed({ agreementId, mailedTo, logContext = "agreement-mail" }) {
  const mailedAt = new Date();
  const mailUpdate = { agreementMailedToUser: true, agreementMailedAt: mailedAt };

  // 1) Primary: the exact agreement record. Always available here because both
  // callers operate on a SignedAgreement fetched moments earlier.
  let agreementTracked = false;
  try {
    const updated = await SignedAgreement.findByIdAndUpdate(agreementId, mailUpdate, { new: false });
    agreementTracked = Boolean(updated);
    if (!updated) {
      console.warn(`[${logContext}] agreement tracking skipped: SignedAgreement not found (${agreementId})`);
    }
  } catch (agreementErr) {
    console.error(`[${logContext}] agreement tracking update failed:`, agreementErr?.message || agreementErr);
  }

  // 2) Backward-compat: the owner User, when it can be found exactly.
  let userTracked = false;
  try {
    const agreement = await SignedAgreement.findById(agreementId).select("userId").lean();
    const ownerId = agreement?.userId;
    if (ownerId && isValidObjectId(String(ownerId))) {
      const updatedUser = await User.findByIdAndUpdate(ownerId, mailUpdate, { new: false });
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
        `[${logContext}] user tracking skipped: no matching User found (agreement ${agreementId})`
      );
    }
  } catch (userErr) {
    console.error(`[${logContext}] user tracking update failed:`, userErr?.message || userErr);
  }

  return { mailedAt, agreementTracked, userTracked };
}

export default markAgreementMailed;
