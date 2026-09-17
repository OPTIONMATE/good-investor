"use client";

import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import ComplaintStatsSection from "@/app/components/admin/ComplaintStatsSection";

export default function AdminComplaintsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Complaints"
        description="Monthly complaint statistics maintained in the SEBI reporting format."
      />
      <ComplaintStatsSection />
    </div>
  );
}