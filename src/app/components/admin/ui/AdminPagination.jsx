"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/app/lib/utils";

/**
 * AdminPagination — THE single shared pagination control for every admin
 * dashboard section (Users, Signed Users, Signed Agreements, Invoices,
 * Risk Profiles, Payments, Subscriptions, Coupons, Plans, Messages …).
 *
 * Presentational / controlled on purpose: the section owns `page` and
 * `pageSize` state (see `usePagination`) and passes them down. That keeps the
 * component swappable between client-side slicing and future server-side
 * pagination (`?page=&limit=`) without touching the UI.
 *
 * Visual language (Home `Cards`/`Blocks`, Services `PlansSection`/`PlanCard`):
 * - rounded-lg controls on neutral-300 hairlines over a white surface
 * - lime accent `#9BE749` for the active page (same accent as the primary CTA
 *   and the "most popular" ring on the public pages), black text on lime
 * - neutral-500 meta text: "Showing X–Y of Z results"
 * - brand-lime focus ring, native buttons so it stays keyboard operable
 *
 * Props
 * - page, totalPages, totalItems, pageSize : controlled state
 * - onPageChange(page)                     : required
 * - onPageSizeChange(size)                 : optional -> renders the selector
 * - pageSizeOptions                        : defaults [10, 25, 50, 100]
 * - itemLabel                              : defaults "results"
 * - disabled                               : blocks interaction while loading
 */
const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

/**
 * Button model: first page, last page, current page and its direct
 * neighbours, with a single ellipsis per gap.
 */
function buildPageItems(page, totalPages) {
  const items = [];
  let previousWasEllipsis = false;

  for (let p = 1; p <= totalPages; p += 1) {
    const isBoundary = p === 1 || p === totalPages;
    const isNearCurrent = Math.abs(p - page) <= 1;

    if (isBoundary || isNearCurrent) {
      items.push(p);
      previousWasEllipsis = false;
    } else if (!previousWasEllipsis) {
      items.push("ellipsis");
      previousWasEllipsis = true;
    }
  }

  return items;
}

const controlClass =
  "inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE749]/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40";

export default function AdminPagination({
  page = 1,
  totalPages,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  onPageSizeChange,
  itemLabel = "results",
  disabled = false,
  emptyMessage = "No results to display on this page.",
  className = "",
}) {
  const resolvedTotalPages = Math.max(
    1,
    Number.isFinite(totalPages)
      ? totalPages
      : Math.ceil(totalItems / (pageSize || 1)),
  );
  const safePage = Math.min(Math.max(page, 1), resolvedTotalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  const handlePageChange = (nextPage) => {
    if (disabled || typeof onPageChange !== "function") return;
    if (nextPage < 1 || nextPage > resolvedTotalPages) return;
    if (nextPage === safePage) return;
    onPageChange(nextPage);
  };

  // Clean empty state when a page ends up with no results.
  if (totalItems === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 px-4 py-4",
          className,
        )}
      >
        <p className="text-sm text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  const pageItems = buildPageItems(safePage, resolvedTotalPages);
  const showNavigation = resolvedTotalPages > 1;
  const showPageSize =
    typeof onPageSizeChange === "function" && pageSizeOptions?.length > 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-neutral-500" role="status" aria-live="polite">
        Showing{" "}
        <span className="font-semibold text-neutral-900">{start}</span>
        {"\u2013"}
        <span className="font-semibold text-neutral-900">{end}</span> of{" "}
        <span className="font-semibold text-neutral-900">{totalItems}</span>{" "}
        {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {showPageSize && (
          <label className="flex items-center gap-1.5 text-sm text-neutral-500">
            <span className="hidden sm:inline">Rows</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              disabled={disabled}
              aria-label="Rows per page"
              className="h-8 rounded-lg border border-neutral-300 bg-white px-2 text-sm font-medium text-neutral-700 outline-none transition focus:border-[#9BE749] focus:ring-2 focus:ring-[#9BE749]/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
        {showNavigation && (
          <nav aria-label="Pagination" className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePageChange(safePage - 1)}
              disabled={disabled || safePage <= 1}
              aria-label="Previous page"
              className={cn(controlClass, "h-8 w-8")}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            {pageItems.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  aria-hidden="true"
                  className="px-1 text-sm text-neutral-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={`page-${item}`}
                  type="button"
                  onClick={() => handlePageChange(item)}
                  disabled={disabled}
                  aria-label={`Go to page ${item}`}
                  aria-current={item === safePage ? "page" : undefined}
                  className={cn(
                    "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE749]/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
                    item === safePage
                      ? "bg-[#9BE749] text-black shadow-sm"
                      : "border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50",
                  )}
                >
                  {item}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => handlePageChange(safePage + 1)}
              disabled={disabled || safePage >= resolvedTotalPages}
              aria-label="Next page"
              className={cn(controlClass, "h-8 w-8")}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
