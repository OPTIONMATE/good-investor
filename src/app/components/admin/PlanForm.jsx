"use client";

import { useState, useEffect } from "react";
import { X, Plus, Loader } from "lucide-react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";

export default function PlanForm({ plan = null, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "monthly",
    description: "",
    price: "",
    duration: "",
    features: [],
    isActive: true,
    displayOrder: "",
  });

  const [featureInput, setFeatureInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Populate form if editing existing plan
  useEffect(() => {
    if (plan) {
      setFormData(plan);
    }
  }, [plan]);

  const planTypes = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "halfYearly", label: "Half Yearly" },
    { value: "yearly", label: "Yearly" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price"
            ? value === ""
              ? ""
              : Number(value)
            : name === "displayOrder"
              ? value === ""
                ? ""
                : Number(value)
              : name === "duration"
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

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput("");
      if (errors.features) {
        setErrors((prev) => ({ ...prev, features: "" }));
      }
    }
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Ensure price and displayOrder are numbers for submission
      const submitData = {
        ...formData,
        price: formData.price === "" ? 0 : Number(formData.price),
        duration: formData.duration === "" ? "" : Number(formData.duration),
        displayOrder: formData.displayOrder === "" ? 0 : Number(formData.displayOrder),
      };

      const response = await fetchWithCsrf(
        plan ? `/api/plans/${plan._id}` : "/api/plans",
        {
          method: plan ? "PUT" : "POST",
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
        plan ? "Plan updated successfully!" : "Plan created successfully!"
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
          {plan ? "Edit Plan" : "Create New Plan"}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Name & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Plan Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Equity Pro"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
              required
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Plan Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
            >
              {planTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-xs text-red-600 mt-1">{errors.type}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of the plan"
            rows={3}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200 resize-none"
          />
          {errors.description && (
            <p className="text-xs text-red-600 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Row 2: Price & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
              required
            />
            {errors.price && (
              <p className="text-xs text-red-600 mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Duration (days) *
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="Enter number of days"
              min="1"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
              required
            />
            {errors.duration && (
              <p className="text-xs text-red-600 mt-1">{errors.duration}</p>
            )}
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Features *
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              placeholder="Type a feature and press Enter or click +"
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Add
            </button>
          </div>

          {/* Features List */}
          <div className="space-y-2 mb-2">
            {formData.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg border border-neutral-200"
              >
                <span className="text-sm text-neutral-700">{feature}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          {errors.features && (
            <p className="text-xs text-red-600 mt-1">{errors.features}</p>
          )}
          <p className="text-xs text-neutral-600">
            {formData.features.length} feature(s) added
          </p>
        </div>

        {/* Row 3: Display Order & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 rounded accent-lime-500"
              />
              <span className="text-sm font-semibold text-neutral-700">
                Plan is Active
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-lime-500 to-lime-600 text-white font-semibold rounded-lg hover:from-lime-600 hover:to-lime-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                {plan ? "Updating..." : "Creating..."}
              </>
            ) : plan ? (
              "Update Plan"
            ) : (
              "Create Plan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
