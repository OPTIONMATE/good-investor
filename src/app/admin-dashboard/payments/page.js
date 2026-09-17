"use client";

import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import PaymentAuditSection from "@/app/components/admin/PaymentAuditSection";

export default function AdminPaymentsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Payments"
        description="Full payment audit trail — transactions, revenue and subscription status."
      />
      <PaymentAuditSection />
    </div>
  );
}