import bcrypt from "bcryptjs";
import OTP from "./models/OTP.js";
import { generateSecureOTP } from "./validators.js";

/**
 * OTP purposes. Each OTP belongs to exactly one purpose so flows never
 * overwrite each other's codes (the root cause this module fixes).
 */
export const OTP_PURPOSES = Object.freeze({
  REGISTRATION: "registration",
  ADMIN_SIGNUP: "admin_signup",
  BUY_VERIFICATION: "buy_verification",
});

const OTP_VALUES = Object.freeze(Object.values(OTP_PURPOSES));

// Matches the existing global OTP attempt limit (validators.js).
const MAX_OTP_ATTEMPTS = 5;
const DEFAULT_TTL_MINUTES = 10;

function isDuplicateKeyError(err) {
  return Boolean(
    err &&
      (err.code === 11000 ||
        (err.name === "MongoServerError" && err.code === 11000) ||
        err.name === "DuplicateKeyError")
  );
}

/**
 * Issue a new OTP for a user + purpose.
 *
 * - Only ONE active (pending) OTP may exist per user+purpose.
 * - Requesting a new OTP for the same purpose invalidates the previous pending
 *   one (latest-wins), so an old emailed code stops working.
 * - OTPs for different purposes are stored as separate documents and never
 *   interfere with each other.
 *
 * @returns {Promise<string>} the plaintext OTP (for the email body only)
 */
export async function issueOTP({ userId, email, purpose, ttlMinutes = DEFAULT_TTL_MINUTES }) {
  if (!userId) throw new Error("userId is required to issue an OTP");
  if (!OTP_VALUES.includes(purpose)) throw new Error(`Unknown OTP purpose: ${purpose}`);

  const otp = generateSecureOTP();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  const pendingQuery = { userId, purpose, status: "pending" };
  const invalidatedAt = new Date();

  // Latest wins: invalidate any currently pending OTP for this user+purpose.
  await OTP.updateMany(pendingQuery, {
    $set: { status: "invalidated", invalidatedAt },
  });

  // Insert. A partial unique index on (userId, purpose) where status="pending"
  // guarantees we can never end up with two active OTPs. If a concurrent
  // request inserted first we invalidate it and retry (bounded).
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await OTP.create({
        userId,
        email: String(email || "").trim().toLowerCase(),
        purpose,
        otpHash,
        status: "pending",
        expiresAt,
        attempts: 0,
      });
      return otp;
    } catch (err) {
      if (!isDuplicateKeyError(err) || attempt === 3) throw err;
      await OTP.updateMany(pendingQuery, {
        $set: { status: "invalidated", invalidatedAt },
      });
    }
  }

  throw new Error("Could not issue OTP");
}

/**
 * Verify a submitted OTP for a user + purpose.
 *
 * @returns {{valid: boolean, reason: string}}
 *   reasons: "not_found" | "attempts_exceeded" | "expired" | "mismatch" |
 *            "already_used" | "ok"
 */
export async function verifyOTP({ userId, purpose, otp, maxAttempts = MAX_OTP_ATTEMPTS }) {
  if (!userId || !OTP_VALUES.includes(purpose)) {
    return { valid: false, reason: "not_found" };
  }

  const record = await OTP.findOne({ userId, purpose, status: "pending" });
  if (!record) return { valid: false, reason: "not_found" };

  if (record.expiresAt && record.expiresAt < new Date()) {
    return { valid: false, reason: "expired" };
  }

  if (record.attempts >= maxAttempts) {
    return { valid: false, reason: "attempts_exceeded" };
  }

  if (!record.otpHash) {
    return { valid: false, reason: "mismatch" };
  }

  const matches = await bcrypt.compare(String(otp), record.otpHash);
  if (!matches) {
    // Track the failed attempt against this specific user+purpose OTP.
    await OTP.updateOne(
      { _id: record._id, status: "pending", attempts: { $lt: maxAttempts } },
      { $inc: { attempts: 1 } }
    );
    return { valid: false, reason: "mismatch" };
  }

  // Single-use: only one of N simultaneous verification requests can claim it.
  const claimed = await OTP.findOneAndUpdate(
    { _id: record._id, status: "pending" },
    { $set: { status: "used", usedAt: new Date() }, $unset: { otpHash: 1 } },
    { returnDocument: "after" }
  );

  if (!claimed) return { valid: false, reason: "already_used" };

  return { valid: true, reason: "ok" };
}

/**
 * Return the most recently issued pending OTP for a user+purpose (used for the
 * resend cooldown).
 */
export async function findLatestPendingOTP({ userId, purpose }) {
  if (!userId) return null;
  return OTP.findOne({ userId, purpose, status: "pending" }).sort({ createdAt: -1 });
}

/**
 * Delete all pending OTPs for a user+purpose (used to clean up after an email
 * send failure so no active code exists that was never delivered).
 */
export async function removePendingOTPs({ userId, purpose }) {
  if (!userId) return;
  await OTP.deleteMany({ userId, purpose, status: "pending" });
}
