"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MenuItem } from "./ui/Navbar-menu";
import { cn } from "@/app/lib/utils";
import { useAuth } from "../context/AuthContext";
import { fetchWithCsrf } from "@/app/lib/csrfClient";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Keep a single source of truth for nav links to avoid mismatches across breakpoints.
  const navLinks = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/services", label: "Services" },
      { href: "/investor-charter", label: "Investor Charter" },
      { href: "/complaint-table", label: "Complaints Table" },
      { href: "/disclaimer-disclosure", label: "Disclaimer & Disclosure" },
      { href: "/mitc", label: "MITC" },
      { href: "/contact", label: "Contact Us" },
    ],
    [],
  );

  const closeMobile = () => setMobileOpen(false);

  // Close the mobile tray when users navigate to a different route.
  useEffect(() => {
    closeMobile();
  }, [pathname]);

  const profileInitial = (user?.username || user?.email || "U")
    .slice(0, 1)
    .toUpperCase();

  return (
    <header className="fixed top-3 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-4">
      <div
        className={cn(
          "flex items-center justify-between gap-2 sm:gap-3 md:gap-6 rounded-full border px-3 sm:px-4 md:px-5 py-2 w-full max-w-screen-xl relative",
          "bg-white/90 backdrop-blur-sm shadow-[0_6px_18px_rgba(0,0,0,0.12)]",
        )}
      >
        {/* Logo — centered on mobile only (absolute), normal flow on desktop */}
        <div className="shrink-0 min-w-0 absolute left-1/2 -translate-x-1/2 lg:static lg:left-auto lg:translate-x-0">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={closeMobile}
          >
            <p className="text-md sm:text-base md:text-lg font-semibold leading-tight truncate">
              Trademilaan
            </p>
          </Link>
        </div>

        {/* Desktop menu */}
        <div className="hidden lg:flex flex-1 justify-center">
          <Menu>
            {navLinks.map((link) => (
              <MenuItem key={link.href} href={link.href}>
                {link.label}
              </MenuItem>
            ))}
          </Menu>
        </div>

        {/* Mobile menu button — pinned to the left corner on mobile only */}
        <button
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="inline-flex items-center justify-center gap-2 rounded-full border md:border-0 px-2.5 py-1.5 lg:hidden order-first lg:order-none"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg
            className="h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="#111"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="hidden sm:inline text-sm font-medium">Menu</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white text-sm cursor-pointer font-semibold shadow hover:bg-neutral-800 transition"
                aria-label="Profile menu"
              >
                {profileInitial}
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute top-12 right-0 z-40 min-w-48 bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                      <p className="text-xs text-neutral-600">Logged in as</p>
                      <p className="font-semibold text-neutral-900 truncate">
                        {user?.email || user?.username}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition"
                    >
                      Profile
                    </Link>
                    {user?.role === "admin" && (
                      <Link
                        href="/admin-dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/my-subscriptions"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition"
                    >
                      My Subscriptions
                    </Link>
                    <button
                      onClick={async () => {
                        setProfileOpen(false);
                        // Logout functionality
                            await fetchWithCsrf("/api/auth/logout", { method: "POST" });
                        // Refresh page to clear auth state
                        window.location.href = "/login";
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CTA */}
          {user ? (
            <Link
              href="/contact"
              className="hidden sm:inline-flex shrink-0 rounded-full bg-[#9BE749] px-3 md:px-6 py-1.5 md:py-2 text-sm md:text-base font-medium"
            >
              Enquire Now
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex shrink-0 rounded-full bg-[#9BE749] px-3 md:px-6 py-1.5 md:py-2 text-sm md:text-base font-medium"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]"
            onClick={closeMobile}
          />
          <div className="fixed top-[76px] sm:top-[86px] left-0 right-0 z-50 px-3 sm:px-4">
            <div className="mx-auto w-full max-w-screen-sm overflow-hidden rounded-2xl border bg-white shadow-xl">
              <div className="flex flex-col p-4 gap-1">
                {user && (
                  <>
                    <Link
                      href="/profile"
                      onClick={closeMobile}
                      className="flex items-center justify-between rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
                    >
                      <span>Profile</span>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
                        {profileInitial}
                      </span>
                    </Link>
                    {user?.role === "admin" && (
                      <Link
                        href="/admin-dashboard"
                        onClick={closeMobile}
                        className="py-3 text-base font-medium text-neutral-700 hover:text-neutral-900"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/my-subscriptions"
                      onClick={closeMobile}
                      className="py-3 text-base font-medium text-neutral-700 hover:text-neutral-900"
                    >
                      My Subscriptions
                    </Link>
                  </>
                )}

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                    className="py-3 text-base font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <Link
                    href="/contact"
                    onClick={closeMobile}
                    className="mt-2 inline-flex items-center justify-center rounded-full bg-[#9BE749] px-4 py-2 text-sm font-semibold"
                  >
                    Enquire Now
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeMobile}
                    className="mt-2 inline-flex items-center justify-center rounded-full bg-[#9BE749] px-4 py-2 text-sm font-semibold"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
