"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  BadgeCheck,
  CalendarClock,
  IndianRupee,
  TrendingUp,
  Wallet,
  RefreshCcw,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import AdminPageHeader from "../components/admin/ui/AdminPageHeader";
import AdminStatCard from "../components/admin/ui/AdminStatCard";
import AdminCard from "../components/admin/ui/AdminCard";
import AdminButton from "../components/admin/ui/AdminButton";
import AdminBadge from "../components/admin/ui/AdminBadge";
import AdminTable from "../components/admin/ui/AdminTable";
import AdminErrorState from "../components/admin/ui/AdminErrorState";
import {
  AdminSkeletonGrid,
  AdminSkeletonTable,
} from "../components/admin/ui/AdminSkeleton";

const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
// Payment.amount is stored in RUPEES (see /api/payment/verify: safeAmount =
// serverPricing.finalAmount = plan.price in rupees; only the Razorpay order
// itself uses paise). Display backend sums directly — never divide by 100.

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Overview loads ONLY the small datasets it needs.
      const [analyticsRes, messagesRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/contact-messages?limit=1"),
      ]);

      const [analytics, messages] = await Promise.all([
        analyticsRes.ok ? analyticsRes.json() : null,
        messagesRes.ok ? messagesRes.json() : null,
      ]);

      if (!analytics?.success) {
        throw new Error("Failed to load overview analytics");
      }

      setData({
        summary: analytics.summary || {},
        recentLogins: analytics.recent_logins || [],
        monthlyRevenue: analytics.monthly_revenue_details || [],
        unreadCount: messages?.stats?.unreadCount || 0,
      });
    } catch (err) {
      console.error("Overview load error:", err);
      setError(err.message || "Unable to load overview");
    } finally {
      setLoading(false);
    }
  };

  // Load once on mount (Overview only needs its own data).
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Admin Overview"
        description="A high-level snapshot of users, revenue, subscriptions and messages."
        actions={
          <AdminButton variant="secondary" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </AdminButton>
        }
      />
{loading && (
        <div className="space-y-6">
          <AdminSkeletonGrid cards={8} />
          <AdminSkeletonTable rows={6} columns={6} />
        </div>
      )}

      {!loading && error && (
        <AdminErrorState
          title="Unable to load overview"
          description="Something went wrong while loading this data."
          onRetry={load}
        />
      )}

      {!loading && !error && data && (
        <div className="space-y-6">
          {/* Unread messages callout */}
          {data.unreadCount > 0 && (
            <Link
              href="/admin-dashboard/messages"
              className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 transition hover:border-red-300 hover:bg-red-100"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-red-800">
                You have {data.unreadCount > 99 ? "99+" : data.unreadCount}{" "}
                unread message{data.unreadCount === 1 ? "" : "s"} from the
                contact form.
              </span>
              <span className="ml-auto shrink-0 text-sm font-semibold text-red-700">
                View →
              </span>
            </Link>
          )}

          {/* Key metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminStatCard
              label="Total Users"
              value={data.summary.total_users ?? 0}
              sub="All registered accounts"
              icon={Users}
            />
            <AdminStatCard
              label="Signups This Month"
              value={data.summary.new_signups_this_month ?? 0}
              sub={`${data.summary.new_signups_today ?? 0} today`}
              icon={UserPlus}
              tone="lime"
            />
            <AdminStatCard
              label="Verified Users"
              value={data.summary.verified_users ?? 0}
              sub="Email verified"
              icon={BadgeCheck}
              tone="success"
            />
            <AdminStatCard
              label="Active Subscriptions"
              value={data.summary.active_subscriptions ?? 0}
              sub="Not yet expired"
              icon={CalendarClock}
              tone="purple"
            />
            <AdminStatCard
              label="Total Revenue"
              value={formatINR(data.summary.total_revenue)}
              sub="All time"
              icon={IndianRupee}
              tone="success"
            />
            <AdminStatCard
              label="Revenue This Month"
              value={formatINR(data.summary.this_month_revenue)}
              sub="Current calendar month"
              icon={TrendingUp}
              tone="lime"
            />
            <AdminStatCard
              label="Paid Users"
              value={data.summary.paid_users_count ?? 0}
              sub="Unique customers"
              icon={Wallet}
              tone="purple"
            />
            <AdminStatCard
              label="Renewals"
              value={data.summary.renewals ?? 0}
              sub="Repeat purchases"
              icon={RefreshCcw}
              tone="warning"
            />
          </div>
        {/* Recent logins */}
          <AdminCard
            title="Recent logins"
            description="Latest account activity across the platform"
          >
            {data.recentLogins.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-500">
                No recent login activity.
              </p>
            ) : (
              <AdminTable
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    render: (row) => (
                      <span className="font-medium text-neutral-900">
                        {row.name || "Unknown"}
                      </span>
                    ),
                  },
                  {
                    key: "email",
                    header: "Email",
                    render: (row) => (
                      <span className="text-neutral-600">{row.email}</span>
                    ),
                  },
                  {
                    key: "method",
                    header: "Method",
                    render: (row) => (
                      <AdminBadge tone="info">{row.method}</AdminBadge>
                    ),
                  },
                  {
                    key: "logged_in_at",
                    header: "Logged in at",
                    render: (row) => (
                      <span className="text-neutral-600">
                        {formatDateTime(row.logged_in_at)}
                      </span>
                    ),
                  },
                ]}
                rows={data.recentLogins.slice(0, 8)}
                minWidth={560}
              />
            )}
          </AdminCard>

          {/* Monthly revenue */}
          <AdminCard
            title="Revenue by month"
            description="Last 6 months of payments"
          >
            {data.monthlyRevenue.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-500">
                No revenue data available yet.
              </p>
            ) : (
              <AdminTable
                columns={[
                  {
                    key: "month",
                    header: "Month",
                    render: (row) => (
                      <span className="font-medium text-neutral-900">
                        {row.month}
                      </span>
                    ),
                  },
                  {
                    key: "revenue",
                    header: "Revenue",
                    align: "right",
                    render: (row) => (
                      <span className="font-semibold text-neutral-900">
                        {formatINR(row.revenue)}
                      </span>
                    ),
                  },
                  {
                    key: "transactions",
                    header: "Transactions",
                    align: "right",
                    render: (row) => (
                      <span className="text-neutral-600">
                        {row.transactions ?? 0}
                      </span>
                    ),
                  },
                  {
                    key: "unique_users",
                    header: "Unique users",
                    align: "right",
                    render: (row) => (
                      <span className="text-neutral-600">
                        {row.unique_users ?? 0}
                      </span>
                    ),
                  },
                ]}
                rows={data.monthlyRevenue}
                minWidth={520}
              />
            )}
          </AdminCard>
        </div>
      )}
    </div>
  );
}