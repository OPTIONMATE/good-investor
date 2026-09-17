"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { fetchWithCsrf } from "@/app/lib/csrfClient";
import { normalizeDob, normalizeGender } from "@/app/lib/profileFields";

export default function EditProfileModal({ isOpen, onClose, onSuccess }) {
  const { user, fetchMe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dob: "",
    gender: "",
    state: "",
    panNumber: "",
  });

  const buildFormFromUser = (profile) => ({
    fullName: profile?.fullName || "",
    phone: profile?.phone || "",
    dob: normalizeDob(profile?.dob) || "",
    gender: normalizeGender(profile?.gender) || "",
    state: profile?.state || "",
    panNumber: profile?.panNumber || "",
  });

  // Re-sync the form each time the modal is opened so it always starts from the
  // values actually persisted on the profile (previously the state was captured
  // on first mount only, so re-opening showed stale/empty fields).
  useEffect(() => {
    if (isOpen) {
      setFormData(buildFormFromUser(user));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate DOB - user must be at least 18 years old
    if (formData.dob) {
      const dob = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 18) {
        setError("You must be at least 18 years old to proceed");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetchWithCsrf("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to update profile");
        setLoading(false);
        return;
      }

      // Refresh user data
      await fetchMe();
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200/70 bg-white/95 shadow-[0_20px_60px_rgba(0,0,0,0.15)] backdrop-blur p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 focus:outline-none"
              placeholder="Enter full name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 focus:outline-none"
              placeholder="Enter phone number"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 focus:outline-none"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 focus:outline-none"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 focus:outline-none"
              placeholder="Enter state"
            />
          </div>

          {/* PAN */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              PAN Number
            </label>
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 focus:outline-none"
              placeholder="Enter PAN number"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-200 text-neutral-700 font-semibold hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-lime-500 text-white font-semibold hover:bg-lime-600 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
