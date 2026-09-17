"use client";

import { RefreshCw } from "lucide-react";
import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import AdminButton from "@/app/components/admin/ui/AdminButton";
import AdminErrorState from "@/app/components/admin/ui/AdminErrorState";
import { AdminSkeletonTable } from "@/app/components/admin/ui/AdminSkeleton";
import { useAdminData } from "@/app/components/admin/ui/useAdminData";
import InvoiceSection from "@/app/components/admin/InvoiceSection";

export default function AdminInvoicesPage() {
  const { data, loading, error, load } = useAdminData(
    "/api/admin/invoices",
    (json) => json.invoices || [],
  );

  return (
    <div>
      <AdminPageHeader
        title="Invoices"
        description="Invoices generated for client purchases, with PDF download."
        actions={
          <AdminButton variant="secondary" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </AdminButton>
        }
      />

      {loading && <AdminSkeletonTable rows={8} columns={6} />}

      {!loading && error && (
        <AdminErrorState
          title="Unable to load invoices"
          description="Something went wrong while loading this data."
          onRetry={load}
        />
      )}

      {!loading && !error && (
        <InvoiceSection data={data || []} />
      )}
    </div>
  );
}