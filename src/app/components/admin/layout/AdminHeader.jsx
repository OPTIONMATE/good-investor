"use client";

import { usePathname } from "next/navigation";
import { Menu, MessageSquare, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { getAdminSectionLabel } from "./navigation";

export default function AdminHeader({
  onOpenSidebar,
  onToggleDesktopSidebar,
  unreadCount = 0,
  mobileOpen = false,
  desktopCollapsed = false,
}) {
  const pathname = usePathname();
  const section = getAdminSectionLabel(pathname);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.05)] sm:px-4">
      {/* Mobile: opens the drawer */}
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        aria-controls="admin-sidebar"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Desktop/tablet: collapses the mounted panel so content expands */}
      <button
        type="button"
        onClick={onToggleDesktopSidebar}
        aria-label={desktopCollapsed ? "Expand navigation" : "Collapse navigation"}
        aria-expanded={!desktopCollapsed}
        aria-controls="admin-sidebar"
        title={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 lg:inline-flex"
      >
        {desktopCollapsed ? (
          <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {/* Mobile-only brand hint */}
      <span className="text-sm font-semibold text-neutral-900 lg:hidden">
        Good Investor
      </span>

      <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm sm:flex">
        <span className="text-neutral-400">Admin</span>
        <span aria-hidden="true" className="text-neutral-300">/</span>
        <span className="font-medium text-neutral-900">{section}</span>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {unreadCount > 0 && (
          <a
            href="/admin-dashboard/messages"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            {unreadCount > 99 ? "99+" : unreadCount} unread
          </a>
        )}
      </div>
    </div>
  );
}