"use client";

import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import ContactMessagesSection from "@/app/components/admin/ContactMessagesSection";

export default function AdminMessagesPage() {
  const handleUnreadChange = (count) => {
    // Keep the persistent sidebar badge in sync.
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("admin:unread-change", { detail: count }),
      );
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description="Enquiries received through the contact form — assign, prioritise and track resolution."
      />
      <ContactMessagesSection onUnreadCountChange={handleUnreadChange} />
    </div>
  );
}