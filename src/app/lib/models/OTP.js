import mongoose from "mongoose";

/**
 * OTP codes are isolated by purpose so that one flow (registration, admin
 * signup, buy verification) can never overwrite or invalidate another flow's
 * code. Only the plaintext OTP is emailed; the database stores a bcrypt hash.
 */
const OTPSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ["registration", "admin_signup", "buy_verification"],
    },
    // bcrypt hash of the OTP. Never store the plaintext OTP.
    otpHash: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "used", "invalidated"],
      default: "pending",
      index: true,
    },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0, min: 0 },
    usedAt: { type: Date, default: null },
    invalidatedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "otps",
  }
);

// At most ONE active (pending) OTP per user + purpose.
// Different purposes for the same user are separate documents and never
// conflict, so a registration OTP, an admin OTP and a buy OTP can safely
// coexist for the same user.
OTPSchema.index(
  { userId: 1, purpose: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

// Lookups by email (registration/admin flows receive the email from the client).
OTPSchema.index({ email: 1, purpose: 1, status: 1, createdAt: -1 });

// Auto-delete expired OTP records (MongoDB TTL monitor runs every ~60s).
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema);