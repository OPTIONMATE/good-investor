"use client";

import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import AnalyticsSection from "@/app/components/admin/AnalyticsSection";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Revenue, signups, logins and platform growth analytics."
      />
      <AnalyticsSection />
    </div>
  );
}