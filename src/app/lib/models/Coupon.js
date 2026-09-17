import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Discount type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
      validate: {
        validator: (v) => v >= 0,
        message: "Discount value must be a non-negative number",
      },
    },
    maxUses: {
      type: Number,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || v > 0;
        },
        message: "Max uses must be greater than 0 or null for unlimited",
      },
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
    expiresAt: {
      type: Date,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || v > new Date();
        },
        message: "Expiration date must be in the future",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "coupons",
  }
);

// Indexes for performance
CouponSchema.index({ isActive: 1, createdAt: -1 }); // For user queries (active coupons)
CouponSchema.index({ code: 1 }); // For code lookup
CouponSchema.index({ expiresAt: 1 }); // For expired coupon filtering
CouponSchema.index({ createdAt: -1 }); // For sorting

export default mongoose.models.Coupon ||
  mongoose.model("Coupon", CouponSchema);
