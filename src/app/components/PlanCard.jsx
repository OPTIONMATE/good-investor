"use client";

import { useState } from "react";
import { Heart, ChevronRight, Check } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import BuyNowModal from "@/app/components/buy/BuyNowModal";

export default function PlanCard({ plan, activeSubscription = null }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const isPopular = plan.type?.toLowerCase() === "popular" || plan.type?.toLowerCase() === "pro";
  const isActivePlan = Boolean(activeSubscription?.expiresAt);

  const activeTillLabel = isActivePlan
    ? new Date(activeSubscription.expiresAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const activePlanTypeLabel = isActivePlan
    ? String(activeSubscription?.planType || plan?.type || "N/A").toUpperCase()
    : "";

  const handleBuyNow = () => {
    if (isActivePlan) {
      router.push("/my-subscriptions");
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    // Open the modal - same flow as existing services
    setShowModal(true);
  };

  return (
    <>
      <div
        className={`group relative h-full overflow-hidden rounded-2xl transition-all duration-300 flex flex-col ${
          isPopular
            ? "ring-2 ring-[#9BE749] shadow-[0_20px_60px_rgba(155,231,73,0.2)] hover:shadow-[0_30px_80px_rgba(155,231,73,0.3)]"
            : "border border-neutral-200 shadow-lg hover:shadow-2xl hover:border-neutral-300"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background */}
        <div className={`absolute inset-0 ${
          isPopular
            ? "bg-linear-to-br from-white via-[#f6f9ff] to-white"
            : "bg-linear-to-br from-white to-neutral-50"
        }`} />

        {/* Popular badge */}
        {isPopular && (
          <div className="absolute top-6 right-6 z-10">
            <div className="inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-linear-to-r from-[#9BE749] to-[#6d5bff] text-white rounded-full shadow-lg">
              ⭐ Most Popular
            </div>
          </div>
        )}

        {isActivePlan && (
          <div className="absolute top-6 left-6 z-10 flex flex-wrap gap-2">
            <div className="inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 rounded-full border border-green-300">
              Active Plan
            </div>
            <div className="inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              {activePlanTypeLabel}
            </div>
          </div>
        )}

        <div className="relative h-full p-6 sm:p-8 flex flex-col">
          {/* Header with badge and heart */}
          <div className="flex items-center justify-between mb-6">
            <span className={`inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full ${
              isPopular
                ? "bg-[#9BE749]/10 text-[#9BE749]"
                : "bg-neutral-100 text-neutral-700"
            }`}>
              {plan.type}
            </span>
            <button className={`p-2 rounded-full transition-all duration-300 ${
              isHovered
                ? "bg-[#9BE749]/10 hover:bg-[#9BE749]/20"
                : "bg-neutral-100 hover:bg-neutral-200"
            }`}
            aria-label={`Add ${plan.name} to wishlist`}
            >
              <Heart size={18} className={`transition-colors ${
                isHovered ? "text-[#9BE749] fill-[#9BE749]" : "text-neutral-600"
              }`} />
            </button>
          </div>

          {/* Plan name */}
          <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
            {plan.name}
          </h3>

          {/* Description */}
          {plan.description && (
            <p className="text-sm text-neutral-600 mb-6 line-clamp-2">
              {plan.description}
            </p>
          )}

          {/* Price section with enhanced styling */}
          <div className={`mb-8 pb-8 border-b ${
            isPopular ? "border-[#9BE749]/20" : "border-neutral-200"
          }`}>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl sm:text-6xl font-black text-neutral-900">
                ₹{plan.price.toLocaleString("en-IN")}
              </span>
              <span className="text-sm font-medium text-neutral-600">
                /{plan.duration === 30 ? "month" : plan.duration === 365 ? "year" : `${plan.duration}d`}
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              {plan.duration === 30 ? "1 Month Access" : plan.duration === 365 ? "1 Year Access" : `${plan.duration} Days Access`}
            </p>
          </div>

          {/* Features list */}
          <div className="grow mb-8">
            <p className="text-xs uppercase font-bold text-neutral-700 mb-4 tracking-wide">
              ✨ What You Get
            </p>
            <ul className="space-y-3">
              {plan.features.slice(0, 5).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#9BE749] shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700 font-medium">{feature}</span>
                </li>
              ))}
              {plan.features.length > 5 && (
                <li className="flex items-start gap-3 pt-2 border-t border-neutral-200">
                  <span className="text-xs font-bold text-[#9BE749]">
                    +{plan.features.length - 5} more
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleBuyNow}
            aria-label={isActivePlan ? `View your active ${plan.name} subscription ending on ${activeTillLabel}` : `Purchase ${plan.name} plan for ₹${plan.price.toLocaleString('en-IN')}`}
            className={`w-full px-6 py-2 sm:py-3 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn transform shadow-lg hover:shadow-xl cursor-pointer ${
              isActivePlan
                ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                : "bg-[#9BE749] text-black hover:bg-[#7dd938]"
            }`}
          >
            {isActivePlan ? "View Active Subscription" : `Buy ${plan.name}`}
            <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
          </button>

          {isActivePlan && (
            <p className="text-xs text-green-700 text-center mt-3 font-semibold">
              Active till {activeTillLabel}
            </p>
          )}

          {/* Footer note */}
          <p className="text-xs text-neutral-500 text-center mt-4 font-medium">
            Cancel anytime • No hidden charges
          </p>
        </div>
      </div>

      {/* Modal with same flow as existing services */}
      {showModal && (
        <BuyNowModal
          onClose={() => setShowModal(false)}
          planData={{
            planId: plan._id,
            planName: plan.name,
            price: plan.price,
            type: plan.type,
            duration: plan.duration,
          }}
        />
      )}
    </>
  );
}
