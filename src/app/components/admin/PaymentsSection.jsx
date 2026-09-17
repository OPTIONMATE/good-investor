"use client";

import { Wallet } from "lucide-react";
import AdminSection from "./ui/AdminSection";
import AdminTable from "./ui/AdminTable";
import AdminBadge from "./ui/AdminBadge";
import AdminEmptyState from "./ui/AdminEmptyState";
import AdminPagination from "./ui/AdminPagination";
import { usePagination } from "./ui/usePagination";

/**
 * PaymentsSection — payments list.
 *
 * Same props (`data`, `isExpiringSoon`) and the same "expiring soon" row
 * highlight (now via AdminTable's rowClassName); restyled with the shared
 * primitives and paginated by the shared AdminPagination.
 */
const DEFAULT_PAGE_SIZE = 10;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

export default function PaymentsSection({ data, isExpiringSoon }) {
  const payments = data || [];

  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    pagedItems,
    setPage,
    setPageSize,
  } = usePagination(payments, DEFAULT_PAGE_SIZE);

  if (!data || data.length === 0) {
    return (
      <AdminSection
        eyebrow="Payments"
        title="Payments"
        description="All recorded payments and their validity windows."
      >
        <AdminEmptyState
          title="No payments found"
          description="Payments will appear here once a purchase is recorded."
          icon={Wallet}
        />
      </AdminSection>
    );
  }

  const expiringSoon = (payment) =>
    typeof isExpiringSoon === "function" ? isExpiringSoon(payment.expiresAt) : false;

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (p) => (
        <span className="font-medium text-neutral-900">{p.name || "—"}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (p) => (
        <span className="text-sm text-neutral-600">{p.email || "—"}</span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (p) => (
        <span className="text-sm text-neutral-600">{p.phone || "—"}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (p) => (
        <span className="font-semibold text-neutral-900">
          ₹{Number(p.amount || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "paidAt",
      header: "Paid at",
      render: (p) => (
        <span className="text-sm text-neutral-600">{formatDate(p.paidAt)}</span>
      ),
    },
    {
      key: "expiresAt",
      header: "Expires at",
      render: (p) => (
        <span className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
          {formatDate(p.expiresAt)}
          {expiringSoon(p) && <AdminBadge tone="warning">Expiring soon</AdminBadge>}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => {
        const expired =
          p.expiresAt && new Date(p.expiresAt).getTime() < Date.now();
        return (
          <AdminBadge tone={expired ? "danger" : "success"} dot>
            {expired ? "Expired" : "Active"}
          </AdminBadge>
        );
      },
    },
  ];

  return (
    <AdminSection
      eyebrow="Payments"
      title="Payments"
      description="All recorded payments and their validity windows."
      footer={
        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel={totalItems === 1 ? "payment" : "payments"}
          emptyMessage="No payments to display on this page."
        />
      }
    >
      <AdminTable
        columns={columns}
        rows={pagedItems}
        minWidth={900}
        rowClassName={(p) => (expiringSoon(p) ? "bg-red-50/60" : "")}
      />
    </AdminSection>
  );
}