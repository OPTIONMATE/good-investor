"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";

export default function CouponForm({ coupon = null, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    maxUses: "",
    expiresAt: "",
    isActive: true,
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Populate form if editing existing coupon
  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxUses: coupon.maxUses || "",
        expiresAt: coupon.expiresAt
          ? new Date(coupon.expiresAt).toISOString().split("T")[0]
          : "",
        isActive: coupon.isActive,
        description: coupon.description || "",
      });
    }
  }, [coupon]);

  const discountTypes = ["percentage", "fixed"];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "discountValue" || name === "maxUses"
            ? value === ""
              ? ""
              : Number(value)
            : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const submitData = {
        ...formData,
        maxUses: formData.maxUses === "" ? null : formData.maxUses,
        expiresAt: formData.expiresAt || null,
      };

      const response = await fetchWithCsrf(
        coupon ? `/api/coupons/${coupon._id}` : "/api/coupons",
        {
          method: coupon ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(submitData),
        }
      );

      const result = await response.json();

      if (!result.success) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ general: result.message });
        }
        return;
      }

      setSuccessMessage(
        coupon ? "Coupon updated successfully!" : "Coupon created successfully!"
      );
      setTimeout(() => {
        onSubmit(result.data);
      }, 500);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ general: "Failed to submit form. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
          {coupon ? "Edit Coupon" : "Create New Coupon"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <X size={24} className="text-neutral-600" />
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Coupon Code */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Coupon Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="e.g., SAVE20, WELCOME10"
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.code
                ? "border-red-300 focus:ring-red-200"
                : "border-neutral-200 focus:ring-lime-200"
            } bg-white outline-none transition focus:ring-2`}
            disabled={coupon !== null} // Disable code change on edit
          />
          {errors.code && (
            <p className="text-red-600 text-sm mt-1">{errors.code}</p>
          )}
          {coupon && (
            <p className="text-neutral-600 text-xs mt-1">
              Code cannot be changed after creation
            </p>
          )}
        </div>

        {/* Discount Type & Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.discountType
                  ? "border-red-300 focus:ring-red-200"
                  : "border-neutral-200 focus:ring-lime-200"
              } bg-white outline-none transition focus:ring-2`}
            >
              {discountTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {errors.discountType && (
              <p className="text-red-600 text-sm mt-1">{errors.discountType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Discount Value <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                max={formData.discountType === "percentage" ? "100" : "999999"}
                className={`w-full px-4 py-3 rounded-l-xl border ${
                  errors.discountValue
                    ? "border-red-300 focus:ring-red-200"
                    : "border-neutral-200 focus:ring-lime-200"
                } bg-white outline-none transition focus:ring-2`}
              />
              <div className="px-4 py-3 bg-neutral-100 border border-l-0 border-neutral-200 rounded-r-xl text-neutral-700 font-semibold">
                {formData.discountType === "percentage" ? "%" : "₹"}
              </div>
            </div>
            {errors.discountValue && (
              <p className="text-red-600 text-sm mt-1">{errors.discountValue}</p>
            )}
          </div>
        </div>

        {/* Max Uses & Expires At */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Max Uses (Optional)
            </label>
            <input
              type="number"
              name="maxUses"
              value={formData.maxUses}
              onChange={handleInputChange}
              placeholder="Leave empty for unlimited"
              min="1"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.maxUses
                  ? "border-red-300 focus:ring-red-200"
                  : "border-neutral-200 focus:ring-lime-200"
              } bg-white outline-none transition focus:ring-2`}
            />
            {errors.maxUses && (
              <p className="text-red-600 text-sm mt-1">{errors.maxUses}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Expires At (Optional)
            </label>
            <input
              type="date"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.expiresAt
                  ? "border-red-300 focus:ring-red-200"
                  : "border-neutral-200 focus:ring-lime-200"
              } bg-white outline-none transition focus:ring-2`}
            />
            {errors.expiresAt && (
              <p className="text-red-600 text-sm mt-1">{errors.expiresAt}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., Special discount for new users"
            rows="2"
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.description
                ? "border-red-300 focus:ring-red-200"
                : "border-neutral-200 focus:ring-lime-200"
            } bg-white outline-none transition focus:ring-2 resize-none`}
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
          )}
          <p className="text-neutral-500 text-xs mt-1">
            {formData.description.length}/200 characters
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="w-5 h-5 rounded border-neutral-300 text-lime-500 focus:ring-lime-500 cursor-pointer"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-neutral-700 cursor-pointer">
            Active Coupon
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-linear-to-r from-lime-500 to-lime-600 text-white font-semibold rounded-xl hover:from-lime-600 hover:to-lime-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? coupon
                ? "Updating..."
                : "Creating..."
              : coupon
                ? "Update Coupon"
                : "Create Coupon"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
