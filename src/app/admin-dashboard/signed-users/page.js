"use client";

import { RefreshCw } from "lucide-react";
import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import AdminButton from "@/app/components/admin/ui/AdminButton";
import AdminErrorState from "@/app/components/admin/ui/AdminErrorState";
import { AdminSkeletonTable } from "@/app/components/admin/ui/AdminSkeleton";
import { useAdminData } from "@/app/components/admin/ui/useAdminData";
import SignedUsersSection from "@/app/components/admin/SignedUsersSection";

export default function AdminSignedUsersPage() {
  const { data, loading, error, load } = useAdminData(
    "/api/admin/signed-users",
    (json) => json.signedUsers || [],
  );

  return (
    <div>
      <AdminPageHeader
        title="Signed Users"
        description="Users who have signed agreements — manage KYC status, emailed documents and renewals."
        actions={
          <AdminButton variant="secondary" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </AdminButton>
        }
      />

      {loading && <AdminSkeletonTable rows={8} columns={7} />}

      {!loading && error && (
        <AdminErrorState
          title="Unable to load signed users"
          description="Something went wrong while loading this data."
          onRetry={load}
        />
      )}

      {!loading && !error && (
        <SignedUsersSection data={data || []} onRefresh={load} />
      )}
    </div>
  );
}