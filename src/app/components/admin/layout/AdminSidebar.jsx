"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ExternalLink } from "lucide-react";
import { ADMIN_NAV_GROUPS, isAdminRouteActive } from "./navigation";
import { cn } from "@/app/lib/utils";

export default function AdminSidebar({
  mobileOpen,
  desktopCollapsed = false,
  onClose,
  unreadCount = 0,
}) {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Hidden from sighted users and assistive tech when off-canvas (mobile)
  // or explicitly collapsed (desktop).
  const visuallyHidden = isDesktop ? desktopCollapsed : !mobileOpen;

  return (
    <>
      {/* Mobile backdrop (sits below the floating site navbar) */}
      {mobileOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-[84px] z-30 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="admin-sidebar"
        className={cn(
          "left-0 top-[92px] z-40 flex w-[276px] max-w-[85vw] flex-col border border-neutral-200 bg-white shadow-xl transition-all duration-200 ease-in-out lg:sticky lg:top-[104px] lg:z-auto lg:h-[calc(100dvh-122px)] lg:w-[276px] lg:max-w-none lg:shrink-0 lg:shadow-none",
          // Mobile drawer.
          mobileOpen
            ? "visible fixed translate-x-3 opacity-100"
            : "invisible pointer-events-none fixed -translate-x-[120%] opacity-0",
          // Desktop mounted panel: always in flow, expands/contracts content.
          "lg:visible lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto",
          desktopCollapsed && "lg:sr-only lg:absolute lg:pointer-events-none",
        )}
        aria-label="Admin navigation"
        aria-hidden={visuallyHidden || undefined}
        inert={visuallyHidden || undefined}
      >
        {/* Mobile drawer header (brand lives in the site navbar) */}
        <div className="flex items-center justify-between gap-2 border-b border-neutral-100 px-4 py-2.5 lg:hidden">
          <span className="text-[13.2px] font-semibold uppercase tracking-wider text-neutral-400">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-[17.6px] w-[17.6px]" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {ADMIN_NAV_GROUPS.map((group, groupIndex) => (
            <div key={group.label}>
              <h2
                className={
                  "px-2 text-[12.1px] font-bold uppercase tracking-[0.14em] text-neutral-900 " +
                  (groupIndex === 0 ? "pb-1.5 pt-3" : "pb-1.5 pt-5")
                }
              >
                {group.label}
              </h2>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = isAdminRouteActive(item.href, pathname);
                  const Icon = item.icon;
                  const badge = item.badgeKey === "unread" ? unreadCount : 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2 py-2 text-[15.4px] font-medium transition-colors",
                          isActive
                            ? "bg-[#9BE749] text-black"
                            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[17.6px] w-[17.6px] shrink-0",
                            isActive ? "text-black" : "text-neutral-400",
                          )}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.label}</span>
                        {badge > 0 && (
                          <span className="ml-auto inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[12.1px] font-bold text-white">
                            {badge > 99 ? "99+" : badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-neutral-100 p-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-[15.4px] font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <ExternalLink className="h-[17.6px] w-[17.6px]" aria-hidden="true" />
            View site
          </Link>
        </div>
      </aside>
    </>
  );
}