"use client";

import { AlertTriangle } from "lucide-react";
import AdminModal from "./AdminModal";
import AdminButton from "./AdminButton";

export default function AdminConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
}) {
  return (
    <AdminModal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      maxWidth="max-w-md"
    >
      {description && (
        <div className="flex gap-3">
          <span
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              danger ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <p className="text-sm text-neutral-600">{description}</p>
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <AdminButton variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </AdminButton>
        <AdminButton
          variant={danger ? "danger" : "primary"}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Please wait…" : confirmLabel}
        </AdminButton>
      </div>
    </AdminModal>
  );
}