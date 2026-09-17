"use client";

import { cn } from "@/app/lib/utils";

/**
 * AdminBadge — the single status pill used across every admin section
 * (Verified / Pending, PAN Verified / PAN Pending, Active / Expired,
 * Read / Unread, priority and ticket statuses).
 *
 * Visual language from Home/Services pills:
 * - `rounded-full`, `font-semibold`, small uppercase-friendly text
 * - soft `*-100` surface with the matching `*-800` text (same recipe as the
 *   services "Active Plan" / "Most Popular" badges)
 * - optional status dot (`h-1.5 w-1.5 rounded-full`) for live state
 */
const badgeTones = {
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  pending: "bg-sky-100 text-sky-800",
  info: "bg-sky-100 text-sky-800",
  error: "bg-red-100 text-red-800",
  accent: "bg-[#9BE749]/20 text-lime-800",
  neutral: "bg-neutral-100 text-neutral-700",
};

const dotTones = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  pending: "bg-sky-500",
  info: "bg-sky-500",
  error: "bg-red-500",
  accent: "bg-[#9BE749]",
  neutral: "bg-neutral-400",
};

const sizes = {
  sm: "px-2.5 py-0.5 text-xs gap-1.5",
  md: "px-3 py-1 text-sm gap-1.5",
};

export default function AdminBadge({
  children,
  tone = "neutral",
  dot = false,
  size = "sm",
  className = "",
  ...rest
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold",
        sizes[size] || sizes.sm,
        badgeTones[tone] || badgeTones.neutral,
        className,
      )}
      {...rest}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            dotTones[tone] || dotTones.neutral,
          )}
        />
      )}
      {children}
    </span>
  );
}
