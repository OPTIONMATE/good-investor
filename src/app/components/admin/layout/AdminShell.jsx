"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { AdminSkeleton, AdminSkeletonTable } from "../ui/AdminSkeleton";

/**
 * Persistent admin shell. Owns:
 * - auth gate
 * - page background
 * - sidebar (desktop persistent / mobile drawer)
 * - header row
 * - main content width + spacing
 */
export default function AdminShell({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || !user || user.role !== "admin") return;

    let cancelled = false;
    // Lightweight call: only the unread count (limit=1 keeps payload tiny).
    fetch("/api/admin/contact-messages?limit=1")
      .then((res) => (res.ok ? res.json() : {}))
      .then((json) => {
        if (!cancelled) setUnreadCount(json?.stats?.unreadCount || 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  // Let the messages page keep the sidebar badge fresh without re-fetching.
  useEffect(() => {
    const onUnreadChange = (e) => {
      if (typeof e?.detail === "number") setUnreadCount(e.detail);
    };
    window.addEventListener("admin:unread-change", onUnreadChange);
    return () => window.removeEventListener("admin:unread-change", onUnreadChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6">
          <AdminSkeleton className="h-6 w-48" />
          <div className="mt-6 grid gap-4">
            <AdminSkeletonTable rows={7} columns={5} />
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Admin content sits below the floating site navbar; the sidebar is
          sticky within this scroll container so it never covers the navbar
          or rides over the footer. Collapsing it lets content expand. */}
      <div className="mx-auto flex w-full max-w-[1440px] items-start gap-3 px-2 pb-10 pt-[92px] sm:gap-4 sm:px-3 lg:gap-6 lg:px-4">
        <AdminSidebar
          mobileOpen={mobileOpen}
          desktopCollapsed={desktopCollapsed}
          onClose={() => setMobileOpen(false)}
          unreadCount={unreadCount}
        />

        <div className="min-w-0 flex-1">
          <AdminHeader
            onOpenSidebar={() => setMobileOpen(true)}
            onToggleDesktopSidebar={() => setDesktopCollapsed((v) => !v)}
            unreadCount={unreadCount}
            mobileOpen={mobileOpen}
            desktopCollapsed={desktopCollapsed}
          />
          <main className="w-full py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}