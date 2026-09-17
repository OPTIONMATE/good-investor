"use client";

import { useState } from "react";

/**
 * Shared pagination state for admin sections.
 *
 * Client-side (today): the admin APIs return full collections, so the hook
 * slices the already filtered/sorted array. Server-side later: keep the same
 * call site and swap the slice for API params — the contract
 * (`page`, `pageSize`, `totalItems`, `totalPages`, `pagedItems`, `setPage`,
 * `setPageSize`) stays identical, so `AdminPagination` needs no change.
 *
 * `resetKey` identifies the current filter/search/sort signature. When it
 * changes, page 1 becomes effective again — computed during render instead of
 * in an effect (no cascading render).
 *
 * @param items            array to paginate (already filtered + sorted)
 * @param defaultPageSize  rows per page (default 10)
 * @param options.resetKey filter/sort signature that returns the view to page 1
 */
export function usePagination(items = [], defaultPageSize = 10, options = {}) {
  const { resetKey = "default", onPageSizeChange } = options;

  const [paging, setPaging] = useState({
    resetKey,
    page: 1,
    pageSize: defaultPageSize,
  });

  const safeItems = Array.isArray(items) ? items : [];
  const totalItems = safeItems.length;
  const pageSize = paging.pageSize;
  const totalPages = Math.max(Math.ceil(totalItems / (pageSize || 1)), 1);

  // Derived, never stored: a changed resetKey simply means "page 1".
  const activePage = paging.resetKey === resetKey ? paging.page : 1;
  const safePage = Math.min(Math.max(activePage, 1), totalPages);
  const pagedItems = safeItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const setPage = (nextPage) => {
    setPaging((prev) => {
      const base = prev.resetKey === resetKey ? prev.page : 1;
      const resolved =
        typeof nextPage === "function" ? nextPage(base) : Number(nextPage);
      return {
        resetKey,
        pageSize: prev.pageSize,
        page: Number.isFinite(resolved) ? resolved : 1,
      };
    });
  };

  const setPageSize = (nextSize) => {
    const numeric = Number(nextSize);
    if (!Number.isFinite(numeric) || numeric <= 0) return;
    setPaging({ resetKey, page: 1, pageSize: numeric });
    if (typeof onPageSizeChange === "function") onPageSizeChange(numeric);
  };

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    pagedItems,
    setPage,
    setPageSize,
    goToPreviousPage: () => setPage((prev) => Math.max(prev - 1, 1)),
    goToNextPage: () => setPage((prev) => Math.min(prev + 1, totalPages)),
  };
}

export default usePagination;