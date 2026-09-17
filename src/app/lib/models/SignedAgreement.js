import mongoose from "mongoose";

const signedAgreementSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    clientName: {
      type: String,
      required: false,
      default: "Unknown",
    },
    clientEmail: {
      type: String,
      required: false,
      default: null,
    },
    clientPan: {
      type: String,
      required: false,
      default: "NOT_PROVIDED",
    },
    clientPhone: {
      type: String,
      required: false,
      default: null,
    },
    clientDob: {
      type: String,
      required: false,
      default: null,
    },
    clientState: {
      type: String,
      required: false,
      default: null,
    },

    // Plan details at the time of signing
    signedPlanName: {
      type: String,
      required: false,
      default: null,
    },
    signedPlanId: {
      type: String,
      required: false,
      default: null,
      index: true,
    },
    signedPlanType: {
      type: String,
      required: false,
      default: null,
    },
    signedPlanDuration: {
      type: Number,
      required: false,
      default: null, // in days
    },

    agreementHtml: {
      type: String,
      required: false,
      default: "",
    },
    signatureData: {
      type: String,
      required: true,
    },
    signedName: {
      type: String,
      default: null,
    },
    signedTimestamp: {
      type: Date,
      required: true,
    },
    signatureTab: {
      type: String,
      enum: ["typed", "draw", "upload"],
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    fileHash: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["DRAFT", "SIGNED", "LOCKED"],
      default: "SIGNED",
      index: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloadedAt: {
      type: Date,
      default: null,
    },
    pdfGeneratedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

signedAgreementSchema.index({ userId: 1, status: 1 });

export default mongoose.models.SignedAgreement ||
  mongoose.model("SignedAgreement", signedAgreementSchema);

