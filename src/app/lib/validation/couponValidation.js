/**
 * Validation utilities for Coupon system
 * Centralized validation logic for consistency
 */

export const validateCouponInput = (data) => {
  const errors = {};

  // Code validation
  if (!data.code || typeof data.code !== "string") {
    errors.code = "Coupon code is required";
  } else if (data.code.trim().length < 3) {
    errors.code = "Coupon code must be at least 3 characters";
  } else if (data.code.length > 20) {
    errors.code = "Coupon code cannot exceed 20 characters";
  }

  // Discount Type validation
  const validTypes = ["percentage", "fixed"];
  if (!data.discountType || !validTypes.includes(data.discountType)) {
    errors.discountType = `Discount type must be one of: ${validTypes.join(", ")}`;
  }

  // Discount Value validation
  if (data.discountValue === undefined || data.discountValue === null) {
    errors.discountValue = "Discount value is required";
  } else if (typeof data.discountValue !== "number" || isNaN(data.discountValue)) {
    errors.discountValue = "Discount value must be a valid number";
  } else if (data.discountValue < 0) {
    errors.discountValue = "Discount value cannot be negative";
  }

  // Percentage validation
  if (data.discountType === "percentage" && data.discountValue > 100) {
    errors.discountValue = "Percentage discount cannot exceed 100%";
  }

  // Max Uses validation (optional)
  if (data.maxUses !== null && data.maxUses !== undefined && data.maxUses !== "") {
    if (typeof data.maxUses !== "number" || !Number.isInteger(data.maxUses)) {
      errors.maxUses = "Max uses must be a whole number";
    } else if (data.maxUses < 1) {
      errors.maxUses = "Max uses must be at least 1";
    }
  }

  // Expires At validation (optional)
  if (data.expiresAt) {
    const expiryDate = new Date(data.expiresAt);
    if (isNaN(expiryDate.getTime())) {
      errors.expiresAt = "Invalid expiration date";
    } else if (expiryDate <= new Date()) {
      errors.expiresAt = "Expiration date must be in the future";
    }
  }

  // Description validation (optional)
  if (data.description && data.description.length > 200) {
    errors.description = "Description cannot exceed 200 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitize coupon data before returning to client
 */
export const sanitizeCoupon = (coupon) => {
  if (!coupon) return null;
  return {
    _id: coupon._id?.toString?.() || "",
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxUses: coupon.maxUses,
    usedCount: coupon.usedCount,
    expiresAt: coupon.expiresAt,
    isActive: coupon.isActive,
    description: coupon.description,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  };
};
