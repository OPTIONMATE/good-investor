import mongoose from "mongoose";

const AgreementSchema = new mongoose.Schema({
  version: {
    type: Number,
    required: true,
    unique: true,
  },
  pdfUrl: {
    type: String,
    required: true,
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.models.Agreement ||
  mongoose.model("Agreement", AgreementSchema);
