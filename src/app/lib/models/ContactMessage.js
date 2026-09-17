import mongoose from "mongoose";

const ContactMessageSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
      maxlength: 64,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 15,
    },
    subject: {
      type: String,
      enum: ["general", "account", "billing", "feedback", "other"],
      default: "general",
      trim: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    clientIp: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected"],
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },
    assignedTo: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "contact_messages",
  },
);

ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ isRead: 1, createdAt: -1 });
ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ priority: 1, createdAt: -1 });
ContactMessageSchema.index({ assignedTo: 1, createdAt: -1 });

export default mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", ContactMessageSchema);
