"use client";

import { Download, FileText } from "lucide-react";
import AdminSection from "./ui/AdminSection";
import AdminTable from "./ui/AdminTable";
import AdminEmptyState from "./ui/AdminEmptyState";
import AdminPagination from "./ui/AdminPagination";
import { usePagination } from "./ui/usePagination";

/**
 * DocumentsSection — uploaded document list.
 *
 * Same `data` prop, same fields (`filename`, `contentType`, `size`,
 * `createdAt`, `secureUrl`) and the same direct download link; restyled with
 * the shared primitives and paginated by the shared AdminPagination.
 */
const DEFAULT_PAGE_SIZE = 10;

export default function DocumentsSection({ data }) {
  const documents = data || [];

  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    pagedItems,
    setPage,
    setPageSize,
  } = usePagination(documents, DEFAULT_PAGE_SIZE);

  if (!data || data.length === 0) {
    return (
      <AdminSection
        eyebrow="Documents"
        title="Uploaded documents"
        description="Files uploaded to the platform."
      >
        <AdminEmptyState
          title="No documents found"
          description="Uploaded documents will appear here."
          icon={FileText}
        />
      </AdminSection>
    );
  }

  const columns = [
    {
      key: "filename",
      header: "File",
      render: (d) => (
        <span className="font-medium text-neutral-900">{d.filename || "—"}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (d) => (
        <span className="text-sm text-neutral-600">{d.contentType || "—"}</span>
      ),
    },
    {
      key: "size",
      header: "Size",
      align: "right",
      render: (d) => (
        <span className="text-sm text-neutral-600">
          {Number.isFinite(d.size) ? `${(d.size / 1024).toFixed(2)} KB` : "—"}
        </span>
      ),
    },
    {
      key: "uploaded",
      header: "Uploaded",
      render: (d) => (
        <span className="text-sm text-neutral-600">
          {d.createdAt
            ? new Date(d.createdAt).toLocaleDateString("en-IN")
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "File",
      align: "right",
      render: (d) =>
        d.secureUrl ? (
          <a
            href={d.secureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE749]/60 focus-visible:ring-offset-2"
            aria-label={`Download ${d.filename || "document"}`}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download
          </a>
        ) : (
          <span className="text-xs text-neutral-400">Unavailable</span>
        ),
    },
  ];

  return (
    <AdminSection
      eyebrow="Documents"
      title="Uploaded documents"
      description="Files uploaded to the platform."
      footer={
        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel={totalItems === 1 ? "document" : "documents"}
          emptyMessage="No documents to display on this page."
        />
      }
    >
      <AdminTable columns={columns} rows={pagedItems} minWidth={720} />
    </AdminSection>
  );
}