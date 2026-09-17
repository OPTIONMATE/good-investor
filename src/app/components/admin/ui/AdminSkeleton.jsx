"use client";

import { cn } from "@/app/lib/utils";

export function AdminSkeleton({ className = "", rows = 1 }) {
  return (
    <span aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "block animate-pulse rounded-md bg-neutral-200/80",
            className,
          )}
        />
      ))}
    </span>
  );
}

export default AdminSkeleton;

export function AdminSkeletonTable({ columns = 4, rows = 6 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="grid gap-4 border-b border-neutral-100 bg-neutral-50 px-4 py-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <AdminSkeleton key={i} className="h-3 w-3/4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="grid gap-4 border-b border-neutral-100 px-4 py-4 last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, col) => (
            <AdminSkeleton key={col} className="h-3.5 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminSkeletonGrid({ cards = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-neutral-200 bg-white p-5"
        >
          <AdminSkeleton className="h-3 w-24" />
          <AdminSkeleton className="mt-3 h-7 w-32" />
          <AdminSkeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}