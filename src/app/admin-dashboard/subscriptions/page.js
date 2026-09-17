"use client";

import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import SubscriptionsSection from "@/app/components/admin/SubscriptionsSection";

export default function AdminSubscriptionsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Subscriptions"
        description="Monitor all user subscriptions and payments across the platform."
      />
      <SubscriptionsSection />
    </div>
  );
}