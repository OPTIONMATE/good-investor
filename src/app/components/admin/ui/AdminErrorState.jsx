"use client";

import { TriangleAlert } from "lucide-react";
import AdminButton from "./AdminButton";

export default function AdminErrorState({
  title = "Unable to load data",
  description = "Something went wrong while loading this data.",
  onRetry,
  retryLabel = "Try again",
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/60 px-6 py-14 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <TriangleAlert className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-red-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-red-700/80">{description}</p>
      )}
      {onRetry && (
        <AdminButton variant="secondary" className="mt-5" onClick={onRetry}>
          {retryLabel}
        </AdminButton>
      )}
    </div>
  );
}