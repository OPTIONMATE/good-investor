import mongoose from "mongoose";

const TicketActivitySchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContactMessage",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["status_change", "priority_change", "assign", "notes_add", "read_status", "create"],
      required: true,
    },
    changedBy: {
      type: String,
      trim: true,
      maxlength: 120,
      required: true,
    },
    oldValue: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    newValue: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "ticket_activities",
  }
);

TicketActivitySchema.index({ ticketId: 1, createdAt: -1 });
TicketActivitySchema.index({ changedBy: 1, createdAt: -1 });

export default mongoose.models.TicketActivity ||
  mongoose.model("TicketActivity", TicketActivitySchema);
