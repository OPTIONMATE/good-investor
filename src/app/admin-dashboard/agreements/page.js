"use client";

import { RefreshCw } from "lucide-react";
import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import AdminButton from "@/app/components/admin/ui/AdminButton";
import AdminErrorState from "@/app/components/admin/ui/AdminErrorState";
import { AdminSkeletonTable } from "@/app/components/admin/ui/AdminSkeleton";
import { useAdminData } from "@/app/components/admin/ui/useAdminData";
import SignedAgreementsSection from "@/app/components/admin/SignedAgreementsSection";

export default function AdminAgreementsPage() {
  const { data, loading, error, load } = useAdminData(
    "/api/admin/signed-agreements",
    (json) => json.signedAgreements || [],
  );

  return (
    <div>
      <AdminPageHeader
        title="Agreements"
        description="Signed client agreements with downloadable PDF copies."
        actions={
          <AdminButton variant="secondary" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </AdminButton>
        }
      />

      {loading && <AdminSkeletonTable rows={8} columns={4} />}

      {!loading && error && (
        <AdminErrorState
          title="Unable to load agreements"
          description="Something went wrong while loading this data."
          onRetry={load}
        />
      )}

      {!loading && !error && (
        <SignedAgreementsSection data={data || []} />
      )}
    </div>
  );
}