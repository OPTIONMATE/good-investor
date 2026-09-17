"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Protected from "../components/Protected";
import LogoutButton from "../components/LogoutButton";
import EditProfileModal from "../components/EditProfileModal";
import { useAuth } from "../context/AuthContext";
import { normalizeGender } from "@/app/lib/profileFields";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine if user has missing critical fields
  const requiredFields = ["fullName", "email", "phone", "panNumber", "dob", "gender", "state"];
  const missingFields = requiredFields.filter((f) => !user?.[f]);
  const needsProfileCompletion = missingFields.length > 0;

  // Navigation handlers
  const goToRiskAssessment = () => router.push("/risk-assessment");

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-lime-50/40 px-4 py-24 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-200/70 bg-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-neutral-500">
                Signed in as
              </p>
              <h1 className="text-2xl font-bold text-neutral-900 leading-tight">
                {user?.username || "User"}
              </h1>
              <p className="text-sm text-neutral-600">{user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={goToRiskAssessment}
                className="hidden sm:inline-flex rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition"
              >
                Risk Assessment
              </button>
              <LogoutButton />
            </div>
          </div>

          <div className="mt-8 grid gap-4 grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Full Name
              </p>
              <p className="text-base font-semibold text-neutral-900">
                {user?.fullName || user?.username || "Not set"}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Email
              </p>
              <p className="text-base font-semibold text-neutral-900">
                {user?.email || "Not set"}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Phone
              </p>
              <p className="text-base font-semibold text-neutral-900">
                {user?.phone || "Not set"}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                PAN
              </p>
              <p className="text-base font-semibold text-neutral-900">
                {user?.panNumber || "Not set"}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Gender
              </p>
              <p className="text-base font-semibold text-neutral-900">
                {normalizeGender(user?.gender) || "Not set"}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                State
              </p>
              <p className="text-base font-semibold text-neutral-900">
                {user?.state || "Not set"}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Date of Birth
              </p>
              <p className="text-base font-semibold text-neutral-900">
                {user?.dob ? new Date(user.dob).toLocaleDateString("en-IN") : "Not set"}
              </p>
            </div>
          </div>

          {needsProfileCompletion && (
            <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                Some profile details are missing: <strong>{missingFields.join(", ")}</strong>. Please complete your profile to continue.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          )}
          {/* Edit Profile Button */}
          <div className="mt-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto px-6 py-3 rounded-lg bg-lime-500 text-white font-semibold hover:bg-lime-600 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setIsModalOpen(false)}
      />
    </Protected>
  );
}
