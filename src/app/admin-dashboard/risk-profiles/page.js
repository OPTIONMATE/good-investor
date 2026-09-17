"use client";

import { RefreshCw } from "lucide-react";
import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import AdminButton from "@/app/components/admin/ui/AdminButton";
import AdminErrorState from "@/app/components/admin/ui/AdminErrorState";
import { AdminSkeletonTable } from "@/app/components/admin/ui/AdminSkeleton";
import { useAdminData } from "@/app/components/admin/ui/useAdminData";
import RiskProfilesSection from "@/app/components/admin/RiskProfilesSection";

export default function AdminRiskProfilesPage() {
  const { data, loading, error, load } = useAdminData(
    "/api/admin/riskprofiles",
    (json) => json.riskprofiles || [],
  );

  return (
    <div>
      <AdminPageHeader
        title="Risk Profiles"
        description="Client risk profiling questionnaires submitted across the platform."
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
          title="Unable to load risk profiles"
          description="Something went wrong while loading this data."
          onRetry={load}
        />
      )}

      {!loading && !error && (
        <RiskProfilesSection data={data || []} />
      )}
    </div>
  );
}