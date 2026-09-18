"use client";

import { useState } from "react";
import { Download, Loader2, FileSignature } from "lucide-react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";
import AdminSection from "./ui/AdminSection";
import AdminTable from "./ui/AdminTable";
import AdminBadge from "./ui/AdminBadge";
import AdminEmptyState from "./ui/AdminEmptyState";
import AdminPagination from "./ui/AdminPagination";
import AdminButton from "./ui/AdminButton";
import AdminSelect from "./ui/AdminSelect";
import { AdminSearchInput, AdminToolbar } from "./ui/AdminToolbar";
import { usePagination } from "./ui/usePagination";

/**
 * SignedAgreementsSection — /admin-dashboard/agreements.
 *
 * Logic preserved exactly: email filter, `download-pdf` POST via
 * fetchWithCsrf, per-row `downloadingId`, `downloadError` alert. Only the
 * markup changed (AdminSection shell + AdminTable + AdminBadge), the shared
 * AdminPagination footer was added, and a "Sort by" control (same AdminSelect
 * pattern as UsersSection) was added to the toolbar.
 */
const DEFAULT_PAGE_SIZE = 10;

const formatSignedDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

export default function SignedAgreementsSection({ data }) {
  const [searchEmail, setSearchEmail] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  // Filter agreements by email (unchanged behaviour)
  const filteredData =
    !searchEmail || !data
      ? data
      : data.filter((a) =>
          (a.clientEmail || "").toLowerCase().includes(searchEmail.toLowerCase()),
        );

  const agreements = filteredData || [];

  // Sort — same "Sort by" control as UsersSection. The array is copied first
  // because `filteredData` can be the `data` prop itself (no email search).
  const sortedAgreements = [...agreements].sort((a, b) => {
    if (sortBy === "client") {
      return String(a?.clientName || "").localeCompare(
        String(b?.clientName || ""),
      );
    }

    if (sortBy === "email") {
      return String(a?.clientEmail || "").localeCompare(
        String(b?.clientEmail || ""),
      );
    }

    if (sortBy === "oldest") {
      return (
        new Date(a?.signedTimestamp || 0).getTime() -
        new Date(b?.signedTimestamp || 0).getTime()
      );
    }

    // Default: most recently signed first
    return (
      new Date(b?.signedTimestamp || 0).getTime() -
      new Date(a?.signedTimestamp || 0).getTime()
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
  } = usePagination(sortedAgreements, DEFAULT_PAGE_SIZE, {
    resetKey: `${searchEmail}|${sortBy}`,
  });

  const handleDownload = async (agreementId, clientEmail) => {
    setDownloadingId(agreementId);
    setDownloadError(null);

    try {
      const response = await fetchWithCsrf(
        "/api/admin/signed-agreements/download-pdf",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agreementId }),
        },
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `agreement-${clientEmail || "unknown"}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      setDownloadError(error.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    {
      key: "agreement",
      header: "Agreement",
      render: (a) => (
        <div className="min-w-0">
          <p className="font-medium text-neutral-900">
            #{String(a._id || "").substring(0, 8)}
          </p>
          <p className="truncate text-xs text-neutral-500">
            {a.clientEmail || a.userId || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (a) => (
        <span className="text-sm text-neutral-600">
          {a.clientName || "Not provided"}
        </span>
      ),
    },
    {
      key: "signed",
      header: "Signed",
      render: (a) => (
        <span className="text-sm text-neutral-600">
          {formatSignedDate(a.signedTimestamp)}
        </span>
      ),
    },
    {
      key: "signature",
      header: "Signature name",
      render: (a) => (
        <span className="text-sm text-neutral-600">{a.signedName || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (a) => (
        <AdminBadge tone="success" dot>
          {a.status || "Signed"}
        </AdminBadge>
      ),
    },
    {
      key: "actions",
      header: "PDF",
      align: "right",
      render: (a) => (
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => handleDownload(a._id, a.clientEmail)}
          disabled={downloadingId === a._id}
          aria-label={`Download agreement PDF for ${a.clientEmail || a._id}`}
        >
          {downloadingId === a._id ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Downloading…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download PDF
            </>
          )}
        </AdminButton>
      ),
    },
  ];

  if (!data || data.length === 0) {
    return (
      <AdminSection>
        <AdminEmptyState
          title="No signed agreements found"
          description="Signed agreements will appear here once clients complete the e-sign flow."
          icon={FileSignature}
        />
      </AdminSection>
    );
  }

  return (
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
            id="admin-agreements-search"
            label="Search by email"
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onClear={() => setSearchEmail("")}
            placeholder="Enter client email…"
            className="sm:w-80"
          />
          <div className="w-full sm:w-52">
            <label
              htmlFor="admin-agreements-sort"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
            >
              Sort by
            </label>
            <AdminSelect
              id="admin-agreements-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest signed first</option>
              <option value="oldest">Oldest signed first</option>
              <option value="client">Client name</option>
              <option value="email">Client email</option>
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
            itemLabel={totalItems === 1 ? "agreement" : "agreements"}
          />
        ) : null
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

      {totalItems === 0 ? (
        <AdminEmptyState
          title="No agreements match your search"
          description="Try a different client email address."
          actionLabel="Clear search"
          onAction={() => setSearchEmail("")}
          icon={FileSignature}
        />
      ) : (
        <AdminTable columns={columns} rows={pagedItems} minWidth={900} />
      )}
    </AdminSection>
  );
}