import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      minlength: [3, "Plan name must be at least 3 characters"],
      maxlength: [50, "Plan name cannot exceed 50 characters"],
    },
    type: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "halfYearly", "yearly"],
      required: [true, "Plan type is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: (v) => v >= 0,
        message: "Price must be a non-negative number",
      },
    },
    duration: {
      type: Number,
      required: [true, "Duration in days is required"],
      min: [1, "Duration must be at least 1 day"],
      validate: {
        validator: (v) => v > 0 && Number.isInteger(v),
        message: "Duration must be a positive integer",
      },
    },
    features: {
      type: [String],
      required: [true, "Features array is required"],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one feature is required",
      },
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "plans",
  }
);

// Indexes for performance
PlanSchema.index({ isActive: 1, createdAt: -1 }); // For user queries (active plans)
PlanSchema.index({ type: 1 }); // For filtering by plan type
PlanSchema.index({ createdAt: -1 }); // For sorting

export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
