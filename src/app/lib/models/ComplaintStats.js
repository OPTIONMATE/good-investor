import mongoose from "mongoose";

const ComplaintStatsSchema = new mongoose.Schema(
  {
    monthlyReceiptRows: [
      {
        source: { type: String, required: true },
        pendingAtEndLastMonth: { type: Number, default: 0 },
        received: { type: Number, default: 0 },
        resolved: { type: Number, default: 0 },
        totalPending: { type: Number, default: 0 },
        pendingOver3Months: { type: Number, default: 0 },
        avgResolutionDays: { type: Number, default: 0 },
      },
    ],
    monthlyTrends: [
      {
        month: { type: String, required: true },
        carriedForward: { type: Number, default: 0 },
        received: { type: Number, default: 0 },
        resolved: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
      },
    ],
    annualTrends: [
      {
        year: { type: String, required: true },
        carriedForward: { type: Number, default: 0 },
        received: { type: Number, default: 0 },
        resolved: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.ComplaintStats ||
  mongoose.model("ComplaintStats", ComplaintStatsSchema);
