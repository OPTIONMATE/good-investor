"use client";

import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import PlansSection from "@/app/components/admin/PlansSection";

export default function AdminPlansPage() {
  return (
    <div>
      <AdminPageHeader
        title="Plans"
        description="Create, edit and manage subscription plans offered to clients."
      />
      <PlansSection />
    </div>
  );
}