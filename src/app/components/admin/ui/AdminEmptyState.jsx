"use client";

import { SearchX } from "lucide-react";
import AdminButton from "./AdminButton";

export default function AdminEmptyState({
  title = "No data found",
  description,
  actionLabel,
  onAction,
  icon: Icon = SearchX,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-neutral-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-neutral-500">{description}</p>
      )}
      {actionLabel && onAction && (
        <AdminButton variant="secondary" className="mt-5" onClick={onAction}>
          {actionLabel}
        </AdminButton>
      )}
    </div>
  );
}