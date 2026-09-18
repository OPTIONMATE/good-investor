"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  IndianRupee,
  TrendingUp,
  Wallet,
} from "lucide-react";
import AdminSection from "./ui/AdminSection";
import AdminStatCard from "./ui/AdminStatCard";
import AdminTable from "./ui/AdminTable";
import AdminBadge from "./ui/AdminBadge";
import AdminEmptyState from "./ui/AdminEmptyState";
import AdminPagination from "./ui/AdminPagination";
import AdminSelect from "./ui/AdminSelect";
import { AdminFilterTabs, AdminToolbar } from "./ui/AdminToolbar";
import { usePagination } from "./ui/usePagination";

/**
 * SubscriptionsSection — /admin-dashboard/subscriptions.
 *
 * Same fetch (`/api/admin/payments`), same all/active/expired filter and same
 * totals; restyled with AdminStatCard + AdminTable and paginated with the
 * shared AdminPagination. A "Sort by" control (same AdminSelect pattern as
 * UsersSection) was added to the toolbar.
 */
const DEFAULT_PAGE_SIZE = 10;

export default function SubscriptionsSection() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, expired
  const [sortBy, setSortBy] = useState("newest");

  const fetchAllPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments", {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      // NOTE: `/api/admin/payments` answers with `{ success, payments }`; the
      // old check only looked at `success`, so anything that omitted the flag
      // (or a non-2xx response) silently produced an empty list. Read `res.ok`
      // first and treat only an explicit `success: false` as a failure.
      if (!res.ok || data.success === false) {
        setError(
          data?.error ||
            data?.message ||
            `Failed to load payments (${res.status})`,
        );
        setPayments([]);
        return;
      }

      setPayments(data.payments || []);
      setError(null);
    } catch (err) {
      setError("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  const getDaysRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === "active") return !isExpired(p.expiresAt);
    if (filter === "expired") return isExpired(p.expiresAt);
    return true;
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const activeCount = payments.filter((p) => !isExpired(p.expiresAt)).length;
  const expiredCount = payments.filter((p) => isExpired(p.expiresAt)).length;

  // Sort — same "Sort by" control as UsersSection, applied after the
  // all/active/expired filter so it only reorders what is on screen.
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (sortBy === "name") {
      return String(a?.name || "").localeCompare(String(b?.name || ""));
    }

    if (sortBy === "email") {
      return String(a?.email || "").localeCompare(String(b?.email || ""));
    }

    if (sortBy === "amountHigh") {
      return Number(b?.amount || 0) - Number(a?.amount || 0);
    }

    if (sortBy === "amountLow") {
      return Number(a?.amount || 0) - Number(b?.amount || 0);
    }

    if (sortBy === "expires") {
      return (
        new Date(a?.expiresAt || 0).getTime() -
        new Date(b?.expiresAt || 0).getTime()
      );
    }

    // Default: most recent payment first
    return (
      new Date(b?.paidAt || 0).getTime() - new Date(a?.paidAt || 0).getTime()
    );
  });

  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    pagedItems,
    setPage,
    setPageSize,
  } = usePagination(sortedPayments, DEFAULT_PAGE_SIZE, {
    resetKey: `${filter}|${sortBy}`,
  });

const columns = [
    {
      key: "name",
      header: "Name",
      render: (payment) => (
        <span className="font-medium text-neutral-900">{payment.name}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (payment) => (
        <span className="text-sm text-neutral-600">{payment.email}</span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (payment) => (
        <span className="text-sm text-neutral-600">{payment.phone}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (payment) => (
        <span className="font-semibold text-neutral-900">
          ₹{Number(payment.amount || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "validity",
      header: "Validity",
      render: (payment) => (
        <span className="text-sm text-neutral-600">
          {Number(payment?.planDuration) > 0
            ? `${Number(payment.planDuration)} days`
            : "—"}
        </span>
      ),
    },
    {
      key: "paidAt",
      header: "Paid date",
      render: (payment) => (
        <span className="text-sm text-neutral-600">
          {new Date(payment.paidAt).toLocaleDateString("en-IN")}
        </span>
      ),
    },
    {
      key: "expiresAt",
      header: "Expires",
      render: (payment) => (
        <span className="text-sm text-neutral-600">
          {new Date(payment.expiresAt).toLocaleDateString("en-IN")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (payment) => {
        const expired = isExpired(payment.expiresAt);
        return (
          <AdminBadge tone={expired ? "danger" : "success"} dot>
            {expired ? "Expired" : "Active"}
          </AdminBadge>
        );
      },
    },
    {
      key: "daysLeft",
      header: "Days left",
      align: "right",
      render: (payment) =>
        isExpired(payment.expiresAt) ? (
          <span className="text-sm font-semibold text-red-600">Expired</span>
        ) : (
          <span className="text-sm font-semibold text-emerald-700">
            {getDaysRemaining(payment.expiresAt)} days
          </span>
        ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#9BE749]" />
      </div>
    );
  }

return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3"
        >
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Summary cards — same numbers as before, AdminStatCard treatment */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Total revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          sub="All recorded payments"
          icon={IndianRupee}
          tone="success"
        />
        <AdminStatCard
          label="Active plans"
          value={activeCount}
          sub="Not yet expired"
          icon={CalendarClock}
          tone="lime"
        />
        <AdminStatCard
          label="Expired plans"
          value={expiredCount}
          sub="Past validity"
          icon={TrendingUp}
          tone="warning"
        />
        <AdminStatCard
          label="Total payments"
          value={payments.length}
          sub="All transactions"
          icon={Wallet}
          tone="purple"
        />
      </div>

      <AdminSection
        toolbar={
          <AdminToolbar
            actions={
              <span className="text-sm text-neutral-500">
                Matching:{" "}
                <span className="font-semibold text-neutral-900">
                  {totalItems}
                </span>
              </span>
            }
          >
            <AdminFilterTabs
              label="Filter"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All subscriptions" },
                { value: "active", label: `Active (${activeCount})` },
                { value: "expired", label: `Expired (${expiredCount})` },
              ]}
            />
            <div className="w-full sm:w-52">
              <label
                htmlFor="admin-subscriptions-sort"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Sort by
              </label>
              <AdminSelect
                id="admin-subscriptions-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="amountHigh">Amount (high to low)</option>
                <option value="amountLow">Amount (low to high)</option>
                <option value="expires">Expiring soonest</option>
              </AdminSelect>
            </div>
          </AdminToolbar>
        }
        footer={
          totalItems > 0 ? (
            <AdminPagination
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel={totalItems === 1 ? "subscription" : "subscriptions"}
            />
          ) : null
        }
      >
        {totalItems === 0 ? (
          <AdminEmptyState
            title="No subscriptions found"
            description="No subscriptions match the selected filter."
          />
        ) : (
          <AdminTable columns={columns} rows={pagedItems} minWidth={1000} />
        )}
      </AdminSection>
    </div>
  );
}