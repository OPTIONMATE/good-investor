import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String, required: true, unique: true },
  razorpay_signature: { type: String, required: true },
  userId: { type: String, default: null, index: true },
  planId: { type: String, default: null, index: true },
  planName: { type: String, default: null },
  planType: { type: String, default: null },
  /** Historical snapshot of the purchased Plan.duration (days). */
  planDuration: { type: Number, default: null },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  couponCode: { type: String, default: null },
  paidAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Optimizes active subscription lookup for duplicate purchase prevention.
PaymentSchema.index({ email: 1, planId: 1, expiresAt: -1 });

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
