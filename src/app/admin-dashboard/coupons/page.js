"use client";

import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import CouponSection from "@/app/components/admin/CouponSection";

export default function AdminCouponsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        description="Manage discount coupons and promotional codes."
      />
      <CouponSection />
    </div>
  );
}