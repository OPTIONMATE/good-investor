"use client";

import { cn } from "@/app/lib/utils";
import { AdminSkeleton } from "./AdminSkeleton";

/**
 * Shared admin table chrome — one table language for every dashboard section.
 *
 * Visual language (Home `Cards` / `Blocks` + Services `PlansSection`):
 * - white surface, `border-neutral-200`, `rounded-xl`, soft shadow
 * - header row: `bg-neutral-50` with uppercase `text-xs font-semibold
 *   tracking-wide text-neutral-500` (same eyebrow treatment as the public
 *   section headings, scaled down for tables)
 * - body rows: hairline separators, `hover:bg-neutral-50/70`
 * - horizontal scroll instead of squeezed columns
 *
 * columns: [{ key, header, align: "left"|"right"|"center", className,
 *             headerClassName, cellClassName, render(row, index) }]
 */
export default function AdminTable({
  columns = [],
  rows = [],
  minWidth = 640,
  className = "",
  empty = null,
  getRowKey,
  rowClassName,
  zebra = false,
  loading = false,
  loadingRows = 5,
}) {
  const resolveRowKey = (row, index) => {
    if (typeof getRowKey === "function") return getRowKey(row, index);
    return row?._id || row?.id || index;
  };

  const alignClass = (align) =>
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-neutral-200 bg-white",
        className,
      )}
    >
      <table
        className="w-full border-collapse text-left text-sm"
        style={{ minWidth }}
      >
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500",
                  alignClass(col.align),
                  col.headerClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: loadingRows }).map((_, rowIndex) => (
              <tr
                key={`skeleton-${rowIndex}`}
                className="border-b border-neutral-100 last:border-b-0"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-4">
                    <AdminSkeleton className="h-3.5 w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length || 1} className="px-4 py-12">
                {empty || (
                  <div className="text-center text-sm text-neutral-500">
                    No data to display
                  </div>
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={resolveRowKey(row, rowIndex)}
                className={cn(
                  "border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50/70",
                  zebra && rowIndex % 2 === 1 ? "bg-neutral-50/40" : "",
                  typeof rowClassName === "function"
                    ? rowClassName(row, rowIndex)
                    : rowClassName,
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 align-middle",
                      alignClass(col.align),
                      col.cellClassName,
                      col.className,
                    )}
                  >
                    {col.render ? col.render(row, rowIndex) : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
