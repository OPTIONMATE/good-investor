"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Download, IndianRupee, Wallet } from "lucide-react";
import AdminSection from "./ui/AdminSection";
import AdminStatCard from "./ui/AdminStatCard";
import AdminTable from "./ui/AdminTable";
import AdminBadge from "./ui/AdminBadge";
import AdminButton from "./ui/AdminButton";
import AdminModal from "./ui/AdminModal";
import AdminSelect from "./ui/AdminSelect";
import AdminEmptyState from "./ui/AdminEmptyState";
import AdminPagination from "./ui/AdminPagination";
import {
  AdminFilterTabs,
  AdminSearchInput,
  AdminToolbar,
} from "./ui/AdminToolbar";
import { AdminSkeletonTable } from "./ui/AdminSkeleton";
import { usePagination } from "./ui/usePagination";

/**
 * PaymentAuditSection — /admin-dashboard/payments.
 *
 * Fetch (`/api/admin/payments-audit`), stats and the search/status filtering
 * are unchanged. Presentation now uses the shared admin kit exactly like
 * /admin-dashboard/invoices: AdminStatCard summary, AdminSection with the
 * search field first in the toolbar (status filter tabs after it), a paginated
 * AdminTable and the shared AdminPagination footer. The row detail that used
 * to expand inline now opens in the shared AdminModal via "View Details".
 */
const DEFAULT_PAGE_SIZE = 10;

export default function PaymentAuditSection() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    activeCount: 0,
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments-audit", {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (data.success) {
        setPayments(data.payments || []);
        setStats(data.stats || {});
        setError(null);
      } else {
        setError(data.message || data.error || "Failed to load payments");
      }
    } catch (err) {
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter and search logic — derived during render (same approach as
  // InvoiceSection), so there is no mirrored state to keep in sync.
  const filteredPayments = (() => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.email?.toLowerCase().includes(term) ||
          p.name?.toLowerCase().includes(term) ||
          p.razorpay_payment_id?.includes(term) ||
          p.razorpay_order_id?.includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => {
        const expired = new Date(p.expiresAt) < new Date();
        if (statusFilter === "active") return !expired;
        if (statusFilter === "expired") return expired;
        return true;
      });
    }

    return filtered;
  })();

  // Sort — same "Sort by" control as UsersSection, applied after the search
  // and status filters so the sorted set always matches what is on screen.
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
      // Soonest expiry first — expired rows (past dates) come first.
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

  // Pagination — shared hook, same contract as the Agreements/Invoices sections.
  // `resetKey` returns the view to page 1 whenever the search term, status
  // filter or sort changes.
  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    pagedItems,
    setPage,
    setPageSize,
  } = usePagination(sortedPayments, DEFAULT_PAGE_SIZE, {
    resetKey: `${searchTerm}|${statusFilter}|${sortBy}`,
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* Date-only for the table cells. The full timestamp ("17 Sept 2026, 06:35 pm")
     made the Paid and Expires columns ~60px wider each, which is what pushed
     the table past its container and produced the horizontal scrollbar. The
     modal and the CSV export keep the exact date-time. */
  const formatDateOnly = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  const daysRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const downloadCSV = () => {
    const headers = ["Date", "Customer", "Email", "Phone", "Amount", "Payment ID", "Order ID", "Status"];
    const rows = filteredPayments.map((p) => [
      formatDate(p.paidAt),
      p.name,
      p.email,
      p.phone,
      p.amount,
      p.razorpay_payment_id,
      p.razorpay_order_id,
      isExpired(p.expiresAt) ? "Expired" : "Active",
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-audit-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const columns = [
    {
      key: "paidAt",
      header: "Paid",
      render: (p) => (
        <span className="text-sm text-neutral-600">{formatDateOnly(p.paidAt)}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (p) => (
        /* max-w + truncate so a long name cannot force the table wider than
           its container (which is what produced the horizontal scrollbar). */
        <div className="min-w-0 max-w-[140px]">
          <p
            className="truncate font-medium text-neutral-900"
            title={p.name || undefined}
          >
            {p.name || "Unknown"}
          </p>
          <p className="truncate text-xs text-neutral-500">{p.phone || "—"}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (p) => (
        <span
          className="block max-w-[160px] truncate text-sm text-neutral-600"
          title={p.email || undefined}
        >
          {p.email || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (p) => (
        <span className="text-sm font-semibold text-neutral-900">
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      key: "expiresAt",
      header: "Expires",
      render: (p) => (
        <span className="text-sm text-neutral-600">{formatDateOnly(p.expiresAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <AdminBadge tone={isExpired(p.expiresAt) ? "danger" : "success"} dot>
          {isExpired(p.expiresAt) ? "Expired" : "Active"}
        </AdminBadge>
      ),
    },
    {
      key: "paymentId",
      header: "Payment ID",
      render: (p) => (
        <span
          className="block max-w-[120px] truncate font-mono text-xs text-neutral-600"
          title={p.razorpay_payment_id || undefined}
        >
          {p.razorpay_payment_id
            ? `${p.razorpay_payment_id.slice(0, 12)}…`
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Details",
      align: "right",
      render: (p) => (
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => setSelectedPayment(p)}
          aria-label={`View details for payment ${p.razorpay_payment_id || p._id}`}
        >
          View Details
        </AdminButton>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminStatCard label="Total revenue" value="—" />
          <AdminStatCard label="Total transactions" value="—" />
          <AdminStatCard label="Active subscriptions" value="—" />
        </div>
        <AdminSkeletonTable rows={8} columns={7} />
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3"
        >
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Summary cards — same numbers as before, AdminStatCard treatment */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard
          label="Total revenue"
          value={formatCurrency(stats.totalRevenue)}
          sub="All captured payments"
          icon={IndianRupee}
          tone="success"
        />
        <AdminStatCard
          label="Total transactions"
          value={stats.totalTransactions ?? 0}
          sub="All recorded payments"
          icon={Wallet}
          tone="lime"
        />
        <AdminStatCard
          label="Active subscriptions"
          value={stats.activeCount ?? 0}
          sub="Not yet expired"
          icon={CalendarClock}
          tone="purple"
        />
      </div>

      <AdminSection
        eyebrow="Payments"
        title="Payment audit"
        description="Every captured transaction with its Razorpay IDs and validity window."
        actions={
          <AdminButton variant="secondary" size="sm" onClick={downloadCSV}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </AdminButton>
        }
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
            <AdminSearchInput
              id="admin-payments-search"
              label="Search payments"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
              placeholder="Search by name, email or payment ID…"
              className="sm:w-80"
            />
            <AdminFilterTabs
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "expired", label: "Expired" },
              ]}
            />
            <div className="w-full sm:w-52">
              <label
                htmlFor="admin-payments-sort"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Sort by
              </label>
              <AdminSelect
                id="admin-payments-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="name">Customer name</option>
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
              itemLabel={totalItems === 1 ? "payment" : "payments"}
            />
          ) : null
        }
      >
        {totalItems === 0 ? (
          <AdminEmptyState
            title="No payments found"
            description="No payments match the current search or filter."
            actionLabel="Clear filters"
            onAction={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            icon={Wallet}
          />
        ) : (
          /* minWidth is only a floor. The admin shell caps its content at
             max-w-[1440px] minus the sidebar, so the table container is ~1090px
             on a large screen. Every variable-width cell (name, email, payment
             ID) is now max-w capped + truncated and the date cells render
             date-only, so the table's intrinsic width stays under that budget
             and the overflow-x-auto scrollbar no longer appears. */
          <AdminTable columns={columns} rows={pagedItems} minWidth={880} />
        )}
      </AdminSection>

      {selectedPayment && (
        <AdminModal
          open
          onClose={() => setSelectedPayment(null)}
          title="Payment details"
          description={
            selectedPayment.email || selectedPayment.name || undefined
          }
          maxWidth="max-w-2xl"
          footer={
            <AdminButton
              variant="secondary"
              onClick={() => setSelectedPayment(null)}
            >
              Close
            </AdminButton>
          }
        >
          <div className="space-y-4">
            {/* Payment information — invoice detail-card treatment */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
              <h3 className="text-sm font-semibold text-neutral-900">
                Payment information
              </h3>
              <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <PaymentDetailItem label="Payment ID">
                  <span className="break-all font-mono text-xs">
                    {selectedPayment.razorpay_payment_id || "—"}
                  </span>
                </PaymentDetailItem>
                <PaymentDetailItem label="Order ID">
                  <span className="break-all font-mono text-xs">
                    {selectedPayment.razorpay_order_id || "—"}
                  </span>
                </PaymentDetailItem>
                <PaymentDetailItem label="Customer">
                  {selectedPayment.name || "Unknown"}
                </PaymentDetailItem>
                <PaymentDetailItem label="Email">
                  {selectedPayment.email || "N/A"}
                </PaymentDetailItem>
                <PaymentDetailItem label="Phone">
                  {selectedPayment.phone || "N/A"}
                </PaymentDetailItem>
                <PaymentDetailItem label="Amount">
                  <span className="text-emerald-700">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </PaymentDetailItem>
                <PaymentDetailItem label="Paid at">
                  {formatDate(selectedPayment.paidAt)}
                </PaymentDetailItem>
                <PaymentDetailItem label="Expires at">
                  {formatDate(selectedPayment.expiresAt)}
                </PaymentDetailItem>
                <PaymentDetailItem label="Status">
                  <AdminBadge
                    tone={
                      isExpired(selectedPayment.expiresAt) ? "danger" : "success"
                    }
                    dot
                  >
                    {isExpired(selectedPayment.expiresAt) ? "Expired" : "Active"}
                  </AdminBadge>
                </PaymentDetailItem>
              </dl>
            </div>

            {/* Summary — services info-banner treatment (same as invoices) */}
            <div className="rounded-xl border border-[#9BE749]/30 bg-linear-to-r from-[#9BE749]/10 via-white to-[#6d5bff]/10 p-4">
              <h3 className="text-sm font-semibold text-neutral-900">Summary</h3>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-neutral-600">
                    Purchased validity
                  </span>
                  <span className="text-sm font-medium text-neutral-900">
                    {Number(selectedPayment?.planDuration) > 0
                      ? `${Number(selectedPayment.planDuration)} days`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-neutral-600">
                    Validity remaining
                  </span>
                  <span className="text-sm font-medium text-neutral-900">
                    {isExpired(selectedPayment.expiresAt)
                      ? "Expired"
                      : `${daysRemaining(selectedPayment.expiresAt)} days`}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4 border-t border-[#9BE749]/30 pt-2">
                  <span className="text-sm font-semibold text-neutral-900">
                    Total amount
                  </span>
                  <span className="text-lg font-bold text-neutral-900">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AdminModal>
      )}
    </>
  );
}

/** Small label/value row used inside the payment detail modal. */
function PaymentDetailItem({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-neutral-900">{children}</dd>
    </div>
  );
}