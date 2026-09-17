"use client";

import { useEffect, useState } from "react";

export default function AnalyticsSection() {
  const [analyticsTab, setAnalyticsTab] = useState("payments");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/analytics", {
        credentials: "include",
      });
      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        setError("Unauthorized");
        return;
      }

      if (!result.success) {
        setError(result.message || "Failed to fetch analytics");
        return;
      }

      setData(result);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-red-800 font-bold mb-2">Error</h2>
        <p className="text-red-700">{error}</p>
        <button
          type="button"
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const summary = data.summary;

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex justify-between items-center gap-4 bg-white rounded-lg p-2 w-full border">
        <div className="flex gap-4 bg-white rounded-lg p-1">
          <button
            type="button"
            onClick={() => setAnalyticsTab("payments")}
            className={`px-6 py-2 rounded-lg font-medium transition cursor-pointer ${
              analyticsTab === "payments"
                ? "bg-linear-to-r from-emerald-500 to-purple-600 text-white"
                : "bg-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            Payments
          </button>
          <button
            type="button"
            onClick={() => setAnalyticsTab("signups")}
            className={`px-6 py-2 rounded-lg font-medium transition cursor-pointer ${
              analyticsTab === "signups"
                ? "bg-linear-to-r from-emerald-500 to-purple-600 text-white"
                : "bg-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            Signups
          </button>
        </div>
        {/* Refresh Button */}
        <button
          type="button"
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-800 transition cursor-pointer"
        >
          Refresh
        </button>
      </div>


      {/* PAYMENTS TAB */}
      {analyticsTab === "payments" && (
        <div className="space-y-6">
          {/* Key Metrics Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payments Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Amounts from /api/admin/analytics are in RUPEES (Payment.amount
                is stored in rupees). Render directly — never divide by 100. */}
            {/* Total Revenue */}
              <div className="bg-linear-to-br from-emerald-50/60 to-emerald-100/20 border border-emerald-200 rounded-lg p-5 hover:shadow-md transition">
                <p className="text-emerald-700 font-medium text-sm mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{Number(summary.total_revenue || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-emerald-600 mt-2">All time</p>
              </div>

              {/* This Month Revenue */}
              <div className="bg-linear-to-br from-blue-50/60 to-blue-100/20 border border-blue-200 rounded-lg p-5 hover:shadow-md transition">
                <p className="text-blue-700 font-medium text-sm mb-2">This Month Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{Number(summary.this_month_revenue || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-blue-600 mt-2">Current month</p>
              </div>

              {/* Active Subscriptions */}
              <div className="bg-linear-to-br from-purple-50/60 to-purple-100/20 border border-purple-200 rounded-lg p-5 hover:shadow-md transition">
                <p className="text-purple-700 font-medium text-sm mb-2">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900">{summary.active_subscriptions}</p>
                <p className="text-xs text-purple-600 mt-2">Active plans</p>
              </div>

              {/* Total Transactions */}
              <div className="bg-linear-to-br from-orange-50/60 to-orange-100/20 border border-orange-200 rounded-lg p-5 hover:shadow-md transition">
                <p className="text-orange-700 font-medium text-sm mb-2">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900">{summary.total_payments}</p>
                <p className="text-xs text-orange-600 mt-2">Payment count</p>
              </div>
            </div>
          </div>

          {/* User & Renewal Metrics */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">User Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Paid Users */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                <p className="text-gray-600 font-medium text-sm mb-2">Paid Users</p>
                <p className="text-3xl font-bold text-gray-900">{summary.paid_users_count}</p>
                <p className="text-xs text-gray-500 mt-2">Unique customers</p>
              </div>

              {/* Renewals */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                <p className="text-gray-600 font-medium text-sm mb-2">Renewals</p>
                <p className="text-3xl font-bold text-emerald-600">{summary.renewals}</p>
                <p className="text-xs text-gray-500 mt-2">Repeat purchases</p>
              </div>

              {/* Billing Events Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                <p className="text-gray-600 font-medium text-sm mb-2">Billing Status</p>
                <div className="flex gap-2 items-baseline">
                  <p className="text-2xl font-bold text-green-600">{summary.renewals}</p>
                  <span className="text-xs text-gray-500">renewals</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Subscription activity</p>
              </div>
            </div>
          </div>

          {/* Revenue Details Table */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue History</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Month</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Revenue</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Transactions</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Unique Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthly_revenue_details?.map((month, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{month.month}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-emerald-600">
                          ₹{Number(month.revenue || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900">{month.transactions}</td>
                        <td className="px-6 py-4 text-right text-sm text-gray-900">{month.unique_users}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIGNUPS TAB */}
      {analyticsTab === "signups" && (
        <div className="space-y-6">
          {/* Key Signup Metrics */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Signups Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Users */}
              <div className="bg-linear-to-br from-emerald-50/60 to-emerald-100/30 border border-emerald-200 rounded-lg p-5 hover:shadow-md transition">
                <p className="text-emerald-700 font-medium text-sm mb-2">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{summary.total_users}</p>
                <p className="text-xs text-emerald-600 mt-2">+{summary.new_signups_today} today</p>
              </div>

              {/* New Signups Today */}
              <div className="bg-linear-to-br from-blue-50/60 to-blue-100/30 border border-blue-200 rounded-lg p-5 hover:shadow-md transition">
                <p className="text-blue-700 font-medium text-sm mb-2">New Signups</p>
                <p className="text-3xl font-bold text-gray-900">{summary.new_signups_today}</p>
                <p className="text-xs text-blue-600 mt-2">Last 24 hours</p>
              </div>

              {/* Logged In Today */}
              <div className="bg-linear-to-br from-green-50/60 to-green-100/30 border border-green-200 rounded-lg p-5 hover:shadow-md transition">
                <p className="text-green-700 font-medium text-sm mb-2">Logged In</p>
                <p className="text-3xl font-bold text-gray-900">{summary.total_logged_in_today}</p>
                <p className="text-xs text-green-600 mt-2">Active today</p>
              </div>

              {/* Active Last 30 Days */}
              <div className="bg-linear-to-br from-purple-50/60 to-purple-100/30 border border-purple-200 rounded-lg p-5 hover:shadow-md transition">
                <p className="text-purple-700 font-medium text-sm mb-2">Monthly Active</p>
                <p className="text-3xl font-bold text-gray-900">{summary.active_last_30_days}</p>
                <p className="text-xs text-purple-600 mt-2">Last 30 days</p>
              </div>
            </div>
          </div>

          {/* Login Methods */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Authentication Methods</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.login_method_breakdown?.map((method, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-linear-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg hover:border-emerald-300 hover:from-emerald-50 hover:to-gray-100 transition"
                  >
                    <span className="text-gray-700 font-medium capitalize text-sm">
                      {method.method === "unknown" ? "Legacy/Other" : method.method}
                    </span>
                    <span className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">{method.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Login Activity */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Method</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Logged In At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_logins?.map((login, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{login.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{login.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-block px-3 py-1 bg-linear-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium capitalize">
                            {login.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {login.logged_in_at
                            ? new Date(login.logged_in_at).toLocaleString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
