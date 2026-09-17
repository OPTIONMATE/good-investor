"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/app/lib/utils";

/**
 * Admin toolbar primitives — the dashboard equivalent of the Home/Services
 * "section header + filter row".
 *
 * Visual language taken from the public pages:
 * - white surface, neutral-200/300 hairlines, rounded-lg / rounded-xl
 * - inputs mirror the home newsletter input: `rounded-lg border
 *   border-slate-200 bg-white px-3 py-2 text-sm` with a violet/lime focus ring
 *   (`focus:ring-2 focus:ring-[#6d5bff]/25` on home, `#9BE749` on services) —
 *   the dashboard standardises on the lime accent used by every admin action.
 * - filter pills mirror the home "Learn More" pill radius + the services
 *   popular-badge treatment (`rounded-full`, lime for the active state).
 */

/** Responsive toolbar row: filters/search on the left, actions on the right. */
export function AdminToolbar({ children, actions, className = "" }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end",
        actions ? "lg:justify-between" : "",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {children}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

export default AdminToolbar;

/** Alias kept for call sites that prefer the descriptive name. */
export const CardActionsToolbar = AdminToolbar;

/** Label + control wrapper so every toolbar field lines up on the same baseline. */
export function AdminToolbarField({
  label,
  htmlFor,
  children,
  className = "",
  width = "w-full sm:w-56",
}) {
  return (
    <div className={cn(width, className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

/** Search box with the site's icon-inside-input treatment. */
export function AdminSearchInput({
  id,
  label = "Search",
  value,
  onChange,
  onClear,
  placeholder = "Search…",
  className = "",
  showLabel = true,
  ...rest
}) {
  const hasValue = String(value || "").length > 0;

  return (
    <div className={cn("w-full", className)}>
      {showLabel && label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden="true"
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-9 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-[#9BE749] focus:ring-2 focus:ring-[#9BE749]/40"
          {...rest}
        />
        {hasValue && typeof onClear === "function" && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE749]/60"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Pill-style single-select filter (used for sort options / status tabs).
 * options: [{ value, label }]
 */
export function AdminFilterTabs({
  options = [],
  value,
  onChange,
  label,
  className = "",
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {label && (
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {label}
        </span>
      )}
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange?.(option.value)}
            aria-pressed={isActive}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE749]/60 focus-visible:ring-offset-2",
              isActive
                ? "bg-[#9BE749] text-black shadow-sm"
                : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
