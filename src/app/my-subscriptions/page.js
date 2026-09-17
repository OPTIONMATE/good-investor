"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function MySubscriptionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    fetchPayments();
  }, [user, loading]);

  const fetchPayments = async () => {
    try {
      setPageLoading(true);
      const res = await fetch("/api/user/payments");
      const data = await res.json();

      if (data.success) {
        setPayments(data.payments || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to load subscriptions");
    } finally {
      setPageLoading(false);
    }
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  const getDaysRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getPaymentIdValue = (payment) => {
    return String(
      payment?.razorpay_payment_id || payment?.paymentId || payment?._id || ""
    );
  };

  const getPaymentIdLabel = (payment) => {
    const paymentId = getPaymentIdValue(payment);
    if (!paymentId) return "N/A";
    return paymentId.length > 12 ? `${paymentId.slice(0, 12)}...` : paymentId;
  };

  const activePayments = payments.filter((p) => !isExpired(p.expiresAt));
  const activePlanIds = new Set(
    activePayments
      .map((p) => String(p?.planId || p?.resolvedPlanId || "").trim())
      .filter(Boolean)
  );

  const currentActivePlan =
    activePayments.find(
      (p) =>
        p?.planName &&
        !["unknown", "unknown plan", "n/a"].includes(
          String(p.planName).trim().toLowerCase()
        )
    ) || activePayments[0] || null;

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-24 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            My Subscriptions
          </h1>
          <p className="text-neutral-600">
            View your active subscriptions and payment history
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {payments.length === 0 ? (
          <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600 mb-4">No subscriptions yet</p>
            <a
              href="/services"
              className="inline-block px-6 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition"
            >
              Browse Plans
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-linear-to-br from-lime-50 to-lime-100/50 rounded-lg p-6 border border-lime-200">
                <p className="text-sm text-neutral-600 mb-1">Total Payments</p>
                <p className="text-3xl font-bold text-lime-600">
                  {payments.length}
                </p>
              </div>

              <div className="bg-linear-to-br from-blue-50 to-blue-100/50 rounded-lg p-6 border border-blue-200">
                <p className="text-sm text-neutral-600 mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="bg-linear-to-br from-purple-50 to-purple-100/50 rounded-lg p-6 border border-purple-200">
                <p className="text-sm text-neutral-600 mb-1">Active Plans</p>
                <p className="text-3xl font-bold text-purple-600">
                  {activePlanIds.size || activePayments.length}
                </p>
              </div>

              <div className="bg-linear-to-br from-amber-50 to-amber-100/50 rounded-lg p-6 border border-amber-200">
                <p className="text-sm text-neutral-600 mb-1">Current Active Plan</p>
                <p className="text-base font-bold text-amber-700 truncate" title={currentActivePlan?.planName || "No active plan"}>
                  {currentActivePlan?.planName || "No active plan"}
                </p>
                <p className="text-xs font-semibold text-amber-600 mt-1 uppercase">
                  {currentActivePlan?.planType || "-"}
                </p>
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                      Plan
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                      Plan Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                      Validity
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                      Payment ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                      Paid Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                      Expires
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                      Days Left
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const expired = isExpired(payment.expiresAt);
                    const daysLeft = getDaysRemaining(payment.expiresAt);

                    return (
                      <tr
                        key={payment._id}
                        className="border-b border-neutral-100 hover:bg-neutral-50 transition"
                      >
                        <td className="py-4 px-4 font-semibold text-neutral-900">
                          {payment.planName || "N/A"}
                        </td>
                        <td className="py-4 px-4 text-neutral-700 uppercase text-xs font-bold tracking-wide">
                          {payment.planType || "N/A"}
                        </td>
                        <td className="py-4 px-4 text-neutral-600">
                          {Number(payment?.planDuration) > 0
                            ? `${Number(payment.planDuration)} days`
                            : "—"}
                        </td>
                        <td className="py-4 px-4 font-mono text-sm text-neutral-600">
                          <span title={getPaymentIdValue(payment) || "Payment ID unavailable"}>
                            {getPaymentIdLabel(payment)}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-neutral-900">
                          ₹{payment.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-4 text-neutral-600">
                          {new Date(payment.paidAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-4 px-4 text-neutral-600">
                          {new Date(payment.expiresAt).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              expired
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {expired ? "Expired" : "Active"}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold">
                          {expired ? (
                            <span className="text-red-600">Expired</span>
                          ) : (
                            <span className="text-green-600">{daysLeft} days</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Renew Button */}
            <div className="mt-6 text-center">
              <a
                href="/services"
                className="inline-block px-8 py-3 bg-lime-500 text-white font-semibold rounded-lg hover:bg-lime-600 transition"
              >
                Renew Subscription
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
