"use client";

import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import PlanCard from "./PlanCard";
import { useAuth } from "@/app/context/AuthContext";

/**
 * PlansSection Component
 * Displays all active plans in a responsive grid
 * Ready to be integrated into /services page or standalone
 */
export default function PlansSection() {
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSubscriptionsByPlan, setActiveSubscriptionsByPlan] = useState({});

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/plans");
        const result = await response.json();

        if (result.success) {
          setPlans(result.data);
          setError("");
        } else {
          setError(result.message || "Failed to fetch plans");
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError("Error loading plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchActiveSubscriptions = async () => {
      if (authLoading || !user) {
        setActiveSubscriptionsByPlan({});
        return;
      }

      try {
        const res = await fetch("/api/user/payments");
        const data = await res.json();

        if (!res.ok || !data?.success || !Array.isArray(data?.payments)) {
          setActiveSubscriptionsByPlan({});
          return;
        }

        const now = new Date();
        const planIdByName = new Map(
          (plans || []).map((plan) => [
            String(plan?.name || "").trim().toLowerCase(),
            String(plan?._id || "").trim(),
          ])
        );

        const activeMap = data.payments.reduce((acc, payment) => {
          let planId = String(payment?.planId || payment?.resolvedPlanId || "").trim();

          if (!planId) {
            const planNameKey = String(payment?.planName || "")
              .trim()
              .toLowerCase();
            planId = planIdByName.get(planNameKey) || "";
          }

          if (!planId || !payment?.expiresAt) return acc;

          const expiresAtDate = new Date(payment.expiresAt);
          if (Number.isNaN(expiresAtDate.getTime()) || expiresAtDate <= now) {
            return acc;
          }

          if (
            !acc[planId] ||
            new Date(acc[planId].expiresAt) < expiresAtDate
          ) {
            acc[planId] = {
              expiresAt: payment.expiresAt,
              paymentId: payment._id,
              planType: payment.planType || "N/A",
            };
          }

          return acc;
        }, {});

        setActiveSubscriptionsByPlan(activeMap);
      } catch (err) {
        console.error("Error fetching active subscriptions:", err);
      }
    };

    fetchActiveSubscriptions();
  }, [user, authLoading, plans]);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="animate-spin mx-auto mb-4 text-lime-500" />
          <p className="text-neutral-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="py-20">
        <div className="bg-neutral-50 border border-neutral-200 text-neutral-600 p-6 rounded-lg text-center">
          No plans available at the moment. Please check back later.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-16 sm:py-24 bg-linear-to-b from-white via-[#f6f9ff] to-white">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-4xl font-black text-neutral-900 mb-6">
          Choose Your <span className="bg-linear-to-r from-[#9BE749] to-[#6d5bff] bg-clip-text text-transparent">Perfect Plan</span>
        </h1>
        <p className="text-neutral-700 text-md max-w-3xl mx-auto font-medium">
          Select the perfect subscription plan tailored to your trading needs. Unlock premium insights, real-time analytics, and expert strategies.
        </p>
      </div>

      {/* Plans Grid */}
      <h2 className="sr-only">Available subscription plans</h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 sm:mb-20">
        {plans.map((plan) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            activeSubscription={activeSubscriptionsByPlan[String(plan._id)] || null}
          />
        ))}
      </div>

      {/* Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-r from-[#9BE749]/10 via-white to-[#6d5bff]/10 border border-[#9BE749]/30 rounded-2xl p-8 sm:p-12 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
            Need Help Choosing?
          </h3>
          <p className="text-neutral-700 mb-8 max-w-2xl mx-auto text-lg">
            Our trading experts can help you select the plan that best matches your investment profile and goals.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3.5 bg-linear-to-r from-[#9BE749] to-[#6d5bff] text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform cursor-pointer"
          >
            Contact Our Team
          </a>
        </div>
      </div>
    </div>
  );
}
