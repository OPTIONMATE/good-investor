"use client";

import { useState } from "react";
import { Download, Loader2, ReceiptText } from "lucide-react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";
import AdminSection from "./ui/AdminSection";
import AdminTable from "./ui/AdminTable";
import AdminBadge from "./ui/AdminBadge";
import AdminEmptyState from "./ui/AdminEmptyState";
import AdminPagination from "./ui/AdminPagination";
import AdminButton from "./ui/AdminButton";
import AdminModal from "./ui/AdminModal";
import { AdminSearchInput, AdminToolbar } from "./ui/AdminToolbar";
import { usePagination } from "./ui/usePagination";

/**
 * InvoiceSection — /admin-dashboard/invoices.
 *
 * Logic preserved exactly: client-name/amount filter, `formatCurrency`,
 * `formatDate`, `download-pdf` POST via fetchWithCsrf, `downloading` flag and
 * `downloadError`. The old bespoke modal container is replaced by the shared
 * AdminModal (same content, same close behaviour + focus trap / Escape), and
 * the list is now a paginated AdminTable using the shared AdminPagination.
 */
const DEFAULT_PAGE_SIZE = 10;

export default function InvoiceSection({ data }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // Filter invoices by client name or amount (unchanged behaviour)
  const filteredData =
    !searchQuery || !data
      ? data
      : data.filter(
          (inv) =>
            (inv.clientName || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            inv.amount?.toString().includes(searchQuery),
        );

  const invoices = filteredData || [];

  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    pagedItems,
    setPage,
    setPageSize,
  } = usePagination(invoices, DEFAULT_PAGE_SIZE, { resetKey: searchQuery });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDownloadInvoice = async (invoiceId, clientName) => {
    setDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetchWithCsrf("/api/admin/invoices/download-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${clientName || "unknown"}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      setDownloadError(error.message);
    } finally {
      setDownloading(false);
    }
  };

  const columns = [
    {
      key: "invoice",
      header: "Invoice",
      render: (inv) => (
        <div className="min-w-0">
          <p className="font-medium text-neutral-900">
            {String(inv._id || "").substring(0, 12)}…
          </p>
          <p className="truncate text-xs text-neutral-500">
            {inv.planName || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (inv) => (
        <span className="text-sm font-medium text-neutral-800">
          {inv.clientName || "Unknown client"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (inv) => (
        <span className="text-sm font-semibold text-neutral-900">
          {formatCurrency(inv.amount)}
        </span>
      ),
    },
    {
      key: "period",
      header: "Service period",
      render: (inv) => (
        <span className="text-sm text-neutral-600">
          {formatDate(inv.startDate)} → {formatDate(inv.endDate)}
        </span>
      ),
    },
    {
      key: "generated",
      header: "Generated",
      render: (inv) => (
        <span className="text-sm text-neutral-600">
          {formatDate(inv.createdAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Type",
      render: () => <AdminBadge tone="success">Invoice</AdminBadge>,
    },
    {
      key: "actions",
      header: "Details",
      align: "right",
      render: (inv) => (
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => setSelectedInvoice(inv)}
          aria-label={`View details for invoice ${inv._id}`}
        >
          View Details
        </AdminButton>
      ),
    },
  ];

  if (!data || data.length === 0) {
    return (
      <AdminSection>
        <AdminEmptyState
          title="No invoices found"
          description="Invoices will appear here once a purchase completes."
          icon={ReceiptText}
        />
      </AdminSection>
    );
  }

  return (
    <>
      <AdminSection
        toolbar={
          <AdminToolbar
            actions={
              <span className="text-sm text-neutral-500">
                Total:{" "}
                <span className="font-semibold text-neutral-900">
                  {data.length}
                </span>
              </span>
            }
          >
            <AdminSearchInput
              id="admin-invoices-search"
              label="Search invoices"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              placeholder="Search by client name or amount…"
              className="sm:w-80"
            />
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
              itemLabel={totalItems === 1 ? "invoice" : "invoices"}
            />
          ) : null
        }
      >
        {totalItems === 0 ? (
          <AdminEmptyState
            title="No invoices match your search"
            description="Try a different client name or amount."
            actionLabel="Clear search"
            onAction={() => setSearchQuery("")}
            icon={ReceiptText}
          />
        ) : (
          <AdminTable columns={columns} rows={pagedItems} minWidth={940} />
        )}
      </AdminSection>

      {selectedInvoice && (
        <AdminModal
          open
          onClose={() => setSelectedInvoice(null)}
          title="Invoice details"
          description={selectedInvoice.clientName || undefined}
          maxWidth="max-w-2xl"
          footer={
            <>
              <AdminButton
                variant="secondary"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={() =>
                  handleDownloadInvoice(
                    selectedInvoice._id,
                    selectedInvoice.clientName,
                  )
                }
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Downloading…
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download PDF
                  </>
                )}
              </AdminButton>
            </>
          }
        >
          {downloadError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50/70 px-4 py-3"
            >
              <p className="text-sm text-red-700">Error: {downloadError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
              <h3 className="text-sm font-semibold text-neutral-900">
                Invoice information
              </h3>
              <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InvoiceDetailItem label="Invoice ID">
                  <span className="break-all">{selectedInvoice._id}</span>
                </InvoiceDetailItem>
                <InvoiceDetailItem label="Client name">
                  {selectedInvoice.clientName || "N/A"}
                </InvoiceDetailItem>
                <InvoiceDetailItem label="Plan">
                  {selectedInvoice.planName || "N/A"}
                </InvoiceDetailItem>
                <InvoiceDetailItem label="Amount">
                  <span className="text-emerald-700">
                    {formatCurrency(selectedInvoice.amount)}
                  </span>
                </InvoiceDetailItem>
                <InvoiceDetailItem label="Generated date">
                  {formatDate(selectedInvoice.createdAt)}
                </InvoiceDetailItem>
                <InvoiceDetailItem label="Start date">
                  {formatDate(selectedInvoice.startDate)}
                </InvoiceDetailItem>
                <InvoiceDetailItem label="End date">
                  {formatDate(selectedInvoice.endDate)}
                </InvoiceDetailItem>
              </dl>
            </div>

            {/* Invoice summary — services info-banner treatment */}
            <div className="rounded-xl border border-[#9BE749]/30 bg-linear-to-r from-[#9BE749]/10 via-white to-[#6d5bff]/10 p-4">
              <h3 className="text-sm font-semibold text-neutral-900">Summary</h3>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-neutral-600">
                    Service period
                  </span>
                  <span className="text-sm font-medium text-neutral-900">
                    {formatDate(selectedInvoice.startDate)} to{" "}
                    {formatDate(selectedInvoice.endDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-neutral-600">
                    Purchased validity
                  </span>
                  <span className="text-sm font-medium text-neutral-900">
                    {Number(selectedInvoice?.planDuration) > 0
                      ? `${Number(selectedInvoice.planDuration)} days`
                      : "—"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4 border-t border-[#9BE749]/30 pt-2">
                  <span className="text-sm font-semibold text-neutral-900">
                    Total amount
                  </span>
                  <span className="text-lg font-bold text-neutral-900">
                    {formatCurrency(selectedInvoice.amount)}
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

/** Small label/value row used inside the invoice detail modal. */
function InvoiceDetailItem({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-neutral-900">{children}</dd>
    </div>
  );
}