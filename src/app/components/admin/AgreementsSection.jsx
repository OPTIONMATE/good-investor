"use client";

import { FileText } from "lucide-react";
import AdminSection from "./ui/AdminSection";
import AdminTable from "./ui/AdminTable";
import AdminBadge from "./ui/AdminBadge";
import AdminEmptyState from "./ui/AdminEmptyState";
import AdminPagination from "./ui/AdminPagination";
import { usePagination } from "./ui/usePagination";

/**
 * AgreementsSection — agreement documents list.
 *
 * Same `data` prop and fields (`title`, `status`, `createdAt`); restyled with
 * the shared primitives and paginated by the shared AdminPagination.
 */
const DEFAULT_PAGE_SIZE = 10;

export default function AgreementsSection({ data }) {
  const agreements = data || [];

  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    pagedItems,
    setPage,
    setPageSize,
  } = usePagination(agreements, DEFAULT_PAGE_SIZE);

  if (!data || data.length === 0) {
    return (
      <AdminSection
        eyebrow="Documents"
        title="Agreements"
        description="Agreement documents published on the platform."
      >
        <AdminEmptyState
          title="No agreements found"
          description="Agreement documents will appear here once they are published."
          icon={FileText}
        />
      </AdminSection>
    );
  }

  const columns = [
    {
      key: "title",
      header: "Agreement",
      render: (a) => (
        <span className="font-medium text-neutral-900">{a.title || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (a) => <AdminBadge tone="info">{a.status || "Active"}</AdminBadge>,
    },
    {
      key: "created",
      header: "Created",
      render: (a) => (
        <span className="text-sm text-neutral-600">
          {a.createdAt
            ? new Date(a.createdAt).toLocaleDateString("en-IN")
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <AdminSection
      eyebrow="Documents"
      title="Agreements"
      description="Agreement documents published on the platform."
      footer={
        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel={totalItems === 1 ? "agreement" : "agreements"}
          emptyMessage="No agreements to display on this page."
        />
      }
    >
      <AdminTable columns={columns} rows={pagedItems} minWidth={560} />
    </AdminSection>
  );
}