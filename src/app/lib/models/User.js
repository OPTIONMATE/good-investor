import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    googleId: { type: String },
    disclaimerAccepted: { type: Boolean, default: false },

    // NEW FIELDS
    fullName: { type: String },
    dob: { type: String },
    gender: { type: String },
    state: { type: String },
    panNumber: { type: String },
    panVerified: { type: Boolean, default: false },
    phone: { type: String },

    emailOtp: { type: String },
    emailOtpExpiry: { type: Date },

    signature: {
      type: String, // base64 or URL
      default: null,
    },
    signatureType: {
      type: String,
      enum: ["typed", "drawn", "uploaded", null],
      default: null,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    // ⬇️ NEW FIELDS FOR PDF AGREEMENT
    pdfAccepted: { type: Boolean, default: false },
    pdfAcceptedAt: { type: Date, default: null },

    // Risk Profile Assessment
    riskProfile: {
      years: String,
      job: String,
      savings: String,
      support: String,
      annual: String,
      objective: String,
      understanding: String,
      strategy: String,
      volatility: String,
      riskiest: String,
      reaction: String,
      taker: String,
    },

    // Analytics & Login Tracking
    authProvider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },

    // Payment proofs
    paymentProofs: [
      {
        fileUrl: { type: String },
        fileName: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
    ],

    // Admin Flags for Signed Agreement Management
    agreementMailedToUser: { type: Boolean, default: false },
    mitcMailedToUser: { type: Boolean, default: false },
    kycUpdatedByAdmin: { type: Boolean, default: false },
    invoiceMailedToUser: { type: Boolean, default: false },

    // Tracking dates for flag changes
    agreementMailedAt: { type: Date, default: null },
    invoiceMailedAt: { type: Date, default: null },
  },

  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
