/**
 * Validation utilities for Plan subscription system
 * Centralized validation logic for consistency
 */

export const validatePlanInput = (data) => {
  const errors = {};

  // Name validation
  if (!data.name || typeof data.name !== "string") {
    errors.name = "Plan name is required";
  } else if (data.name.trim().length < 3) {
    errors.name = "Plan name must be at least 3 characters";
  } else if (data.name.length > 50) {
    errors.name = "Plan name cannot exceed 50 characters";
  }

  // Type validation
  const validTypes = ["weekly", "monthly", "quarterly", "halfYearly", "yearly"];
  if (!data.type || !validTypes.includes(data.type)) {
    errors.type = `Plan type must be one of: ${validTypes.join(", ")}`;
  }

  // Price validation
  if (data.price === undefined || data.price === null) {
    errors.price = "Price is required";
  } else if (typeof data.price !== "number" || isNaN(data.price)) {
    errors.price = "Price must be a valid number";
  } else if (data.price < 0) {
    errors.price = "Price cannot be negative";
  }

  // Duration validation
  if (data.duration === undefined || data.duration === null) {
    errors.duration = "Duration in days is required";
  } else if (
    typeof data.duration !== "number" ||
    !Number.isInteger(data.duration)
  ) {
    errors.duration = "Duration must be a whole number";
  } else if (data.duration < 1) {
    errors.duration = "Duration must be at least 1 day";
  }

  // Features validation
  if (!Array.isArray(data.features)) {
    errors.features = "Features must be an array";
  } else if (data.features.length === 0) {
    errors.features = "At least one feature is required";
  } else {
    const invalidFeatures = data.features.filter(
      (f) => typeof f !== "string" || f.trim().length === 0
    );
    if (invalidFeatures.length > 0) {
      errors.features =
        "Each feature must be a non-empty string";
    }
  }

  // Description validation (optional)
  if (data.description && data.description.length > 500) {
    errors.description = "Description cannot exceed 500 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Check if user has admin role
 * @param {object} user - User object from JWT
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return user && user.role === "admin";
};

/**
 * Sanitize plan data before returning to client
 */
export const sanitizePlan = (plan) => {
  if (!plan) return null;
  return {
    _id: plan._id,
    name: plan.name,
    type: plan.type,
    description: plan.description,
    price: plan.price,
    duration: plan.duration,
    features: plan.features,
    isActive: plan.isActive,
    displayOrder: plan.displayOrder,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
};
