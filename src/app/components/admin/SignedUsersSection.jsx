"use client";

import { useMemo, useState, useEffect } from "react";
import { Download, Check, X } from "lucide-react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";
import AdminSection from "./ui/AdminSection";
import AdminTable from "./ui/AdminTable";
import AdminBadge from "./ui/AdminBadge";
import AdminEmptyState from "./ui/AdminEmptyState";
import AdminPagination from "./ui/AdminPagination";
import AdminButton from "./ui/AdminButton";
import AdminModal from "./ui/AdminModal";
import {
  AdminFilterTabs,
  AdminSearchInput,
  AdminToolbar,
} from "./ui/AdminToolbar";
import { usePagination } from "./ui/usePagination";

/**
 * SignedUsersSection — /admin-dashboard/signed-users.
 *
 * All behaviour is preserved verbatim: `data`/`onRefresh` props, local row
 * patching after PATCH `/api/admin/signed-users/update`, POST
 * `/api/admin/signed-users/send-agreement`, CSV export, sort options, the
 * confirm/result/KYC dialogs and the responsive mobile card list. Only the
 * markup moved onto the shared primitives, plus the shared AdminPagination
 * footer (mobile cards and desktop table paginate from the same slice).
 */
const DEFAULT_PAGE_SIZE = 10;

const formatDate = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateWithTime = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toSearchText = (user) =>
  [user?.name, user?.email, user?.mobile, user?.pan, user?.serviceName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

/** Yes/No pill — meaning preserved (green = Yes, red = No). */
const StatusBadge = ({ value, label }) => (
  <AdminBadge tone={value ? "success" : "danger"} size="md">
    {value ? (
      <Check className="h-4 w-4" aria-hidden="true" />
    ) : (
      <X className="h-4 w-4" aria-hidden="true" />
    )}
    {value ? label || "Yes" : "No"}
  </AdminBadge>
);

/** Mailed / not-mailed text indicator — meaning preserved. */
const MailStatusText = ({ value }) =>
  value ? (
    <span className="text-sm font-semibold text-emerald-700">Yes</span>
  ) : (
    <span className="text-sm font-semibold text-red-600">No</span>
  );

export default function SignedUsersSection({ data = [], onRefresh }) {
  const [localUsers, setLocalUsers] = useState(data || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dateOfConsent");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [sendingAgreementId, setSendingAgreementId] = useState(null);
  const [resultModal, setResultModal] = useState(null);
  const [confirmSendModal, setConfirmSendModal] = useState(null);
  const [kycDialog, setKycDialog] = useState(null);

  useEffect(() => {
    console.log("[SignedUsersSection] Data received:", data);
    console.log("[SignedUsersSection] Data length:", data?.length || 0);
    setLocalUsers(data || []);
  }, [data]);

  const updateUserStatus = async (userId, statusType, value) => {
    setUpdatingUserId(userId);
    try {
      const updatePayload = {};
      updatePayload[statusType] = value;

      const response = await fetchWithCsrf("/api/admin/signed-users/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updatePayload }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update only the changed row locally to avoid table-wide re-render/flicker.
      setLocalUsers((prev) =>
        prev.map((u) =>
          u.userId === userId ? { ...u, [statusType]: value } : u,
        ),
      );

      setKycDialog(null);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleConfirmedSend = async () => {
    if (!confirmSendModal) return;
    const agreementId = confirmSendModal.agreementId;
    try {
      setSendingAgreementId(agreementId);
      const res = await fetchWithCsrf("/api/admin/signed-users/send-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agreementId }),
      });
      const payload = await res.json();
      if (!res.ok)
        throw new Error(payload.error || payload.message || "Failed to send");
      setLocalUsers((prev) =>
        prev.map((row) =>
          row._id === agreementId ? { ...row, agreementMailedToUser: true } : row,
        ),
      );
      setResultModal({
        type: "success",
        message: `Agreement mailed successfully to ${confirmSendModal.email}`,
      });
    } catch (err) {
      console.error("Send agreement failed:", err);
      setResultModal({
        type: "error",
        message: `Failed to send agreement: ${err.message}`,
      });
    } finally {
      setSendingAgreementId(null);
      setConfirmSendModal(null);
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = normalizedSearch
      ? localUsers.filter((user) => toSearchText(user).includes(normalizedSearch))
      : [...localUsers];

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return String(a?.name || "").localeCompare(String(b?.name || ""));
      }

      if (sortBy === "email") {
        return String(a?.email || "").localeCompare(String(b?.email || ""));
      }

      if (sortBy === "serviceName") {
        return String(a?.serviceName || "").localeCompare(
          String(b?.serviceName || ""),
        );
      }

      // Default: newest consent date first
      const aDate = new Date(a?.dateOfConsent || 0).getTime();
      const bDate = new Date(b?.dateOfConsent || 0).getTime();
      return bDate - aDate;
    });

    return filtered;
  }, [localUsers, searchTerm, sortBy]);

  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    pagedItems,
    setPage,
    setPageSize,
  } = usePagination(filteredAndSortedUsers, DEFAULT_PAGE_SIZE, {
    resetKey: `${searchTerm}|${sortBy}`,
  });

  const exportSignedUsersCsv = () => {
    const headers = [
      "Name",
      "PAN",
      "DOB",
      "Date of Consent",
      "Email",
      "Mobile",
      "State",
      "Service Name",
      "Agreement Mailed To User",
      "MITC Mailed To User",
      "KYC Updated By Admin",
      "Valid From",
      "Valid Till",
      "Renewal Date",
      "Invoice Mailed To User",
    ];

    const rows = filteredAndSortedUsers.map((u) => [
      u?.name || "",
      u?.pan || "",
      u?.dob || "",
      formatDate(u?.dateOfConsent),
      u?.email || "",
      u?.mobile || "",
      u?.state || "",
      u?.serviceName || "",
      u?.agreementMailedToUser ? "Yes" : "No",
      u?.mitcMailedToUser ? "Yes" : "No",
      u?.kycUpdatedByAdmin ? "Yes" : "No",
      formatDate(u?.validFrom),
      formatDate(u?.validTill),
      formatDate(u?.renewalDate),
      u?.invoiceMailedToUser ? "Yes" : "No",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `signed-users-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () =>
    onRefresh ? onRefresh() : window.location.reload();

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (u) => (
        <span className="font-medium text-neutral-900">{u?.name || "—"}</span>
      ),
    },
    {
      key: "pan",
      header: "PAN",
      render: (u) => (
        <span className="font-mono text-sm uppercase text-neutral-700">
          {u?.pan || "—"}
        </span>
      ),
    },
    {
      key: "dob",
      header: "DOB",
      render: (u) => <span className="text-sm text-neutral-600">{u?.dob}</span>,
    },
    {
      key: "consent",
      header: "Consent date",
      render: (u) => (
        <span className="text-sm text-neutral-600">
          {formatDateWithTime(u?.dateOfConsent)}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (u) => (
        <span className="text-sm text-neutral-600">{u?.email}</span>
      ),
    },
    {
      key: "mobile",
      header: "Mobile",
      render: (u) => (
        <span className="text-sm text-neutral-600">{u?.mobile}</span>
      ),
    },
    {
      key: "state",
      header: "State",
      render: (u) => (
        <span className="text-sm text-neutral-600">{u?.state}</span>
      ),
    },
    {
      key: "service",
      header: "Service",
      render: (u) => (
        <span className="text-sm font-medium text-neutral-800">
          {u?.serviceName}
        </span>
      ),
    },
    {
      key: "agreementMailed",
      header: "Agreement mailed",
      render: (u) => <MailStatusText value={u?.agreementMailedToUser} />,
    },
    {
      key: "mitcMailed",
      header: "MITC mailed",
      render: (u) => <MailStatusText value={u?.mitcMailedToUser} />,
    },
    {
      key: "kyc",
      header: "KYC updated",
      render: (u) => (
        <button
          type="button"
          onClick={() =>
            setKycDialog({
              userId: u.userId,
              name: u?.name || "User",
              currentValue: Boolean(u?.kycUpdatedByAdmin),
              selectedValue: Boolean(u?.kycUpdatedByAdmin),
            })
          }
          className="rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE749]/60 focus-visible:ring-offset-2"
          aria-label={`Update KYC status for ${u?.name || "user"}`}
        >
          <StatusBadge value={u?.kycUpdatedByAdmin} />
        </button>
      ),
    },
    {
      key: "validFrom",
      header: "Valid from",
      render: (u) => (
        <span className="text-sm text-neutral-600">
          {formatDate(u?.validFrom)}
        </span>
      ),
    },
    {
      key: "validTill",
      header: "Valid till",
      render: (u) => (
        <span className="text-sm text-neutral-600">
          {formatDate(u?.validTill)}
        </span>
      ),
    },
    {
      key: "renewal",
      header: "Renewal",
      render: (u) => (
        <span className="text-sm text-neutral-600">
          {formatDate(u?.renewalDate)}
        </span>
      ),
    },
    {
      key: "invoiceMailed",
      header: "Invoice mailed",
      render: (u) => <StatusBadge value={u?.invoiceMailedToUser} />,
    },
    {
      key: "actions",
      header: "Send agreement",
      align: "right",
      render: (u) => (
        <AdminButton
          variant="secondary"
          size="sm"
          disabled={sendingAgreementId === u._id}
          onClick={() =>
            setConfirmSendModal({
              agreementId: u._id,
              email: u.email,
              name: u.name,
            })
          }
          aria-label={`Send agreement email to ${u?.email || "user"}`}
        >
          {sendingAgreementId === u._id ? "Sending…" : "Send"}
        </AdminButton>
      ),
    },
  ];

  if (totalItems === 0 && (!localUsers || localUsers.length === 0)) {
    return (
      <AdminSection>
        <AdminEmptyState
          title="No signed users found"
          description="There are no signed agreements in the system yet."
          actionLabel="Refresh"
          onAction={handleRefresh}
        />
      </AdminSection>
    );
  }

  return (
    <AdminSection
      toolbar={
        <div className="flex flex-col gap-3">
          <AdminToolbar
            actions={
              <>
                <span className="text-sm text-neutral-500">
                  Total:{" "}
                  <span className="font-semibold text-neutral-900">
                    {filteredAndSortedUsers.length}
                  </span>
                </span>
                <AdminButton
                  variant="primary"
                  size="sm"
                  onClick={exportSignedUsersCsv}
                  disabled={filteredAndSortedUsers.length === 0}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export CSV
                </AdminButton>
              </>
            }
          >
            <AdminSearchInput
              id="signed-users-search"
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
              placeholder="Name, email, mobile, PAN, or service…"
              className="sm:w-96"
            />
          </AdminToolbar>
          <AdminFilterTabs
            label="Sort"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "dateOfConsent", label: "Date" },
              { value: "name", label: "Name" },
              { value: "email", label: "Email" },
              { value: "serviceName", label: "Service" },
            ]}
          />
        </div>
      }
      footer={
        totalItems > 0 ? (
          <AdminPagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel={totalItems === 1 ? "signed user" : "signed users"}
          />
        ) : null
      }
    >
      {totalItems === 0 ? (
        <AdminEmptyState
          title="No signed users match your search"
          description="Try a different name, email, mobile, PAN or service."
          actionLabel="Clear search"
          onAction={() => setSearchTerm("")}
        />
      ) : (
        <>
          {/* Mobile card list (< md) — same fields as the desktop table */}
          <div className="space-y-3 md:hidden">
            {pagedItems.map((u) => (
              <article
                key={u._id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
              >
                <header className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-neutral-900">
                      {u?.name || "—"}
                    </h3>
                    <p className="truncate text-sm text-neutral-500">
                      {u?.email}
                    </p>
                  </div>
                  <AdminBadge tone="accent" dot>
                    {u?.serviceName || "Service"}
                  </AdminBadge>
                </header>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <MobileField label="PAN">{u?.pan}</MobileField>
                  <MobileField label="DOB">{u?.dob}</MobileField>
                  <MobileField label="Mobile">{u?.mobile}</MobileField>
                  <MobileField label="State">{u?.state}</MobileField>
                  <MobileField label="Consent date">
                    {formatDate(u?.dateOfConsent)}
                  </MobileField>
                  <MobileField label="Valid from">
                    {formatDate(u?.validFrom)}
                  </MobileField>
                  <MobileField label="Valid till">
                    {formatDate(u?.validTill)}
                  </MobileField>
                  <MobileField label="Renewal">
                    {formatDate(u?.renewalDate)}
                  </MobileField>
                </dl>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Agreement mailed
                    <MailStatusText value={u?.agreementMailedToUser} />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    MITC mailed
                    <MailStatusText value={u?.mitcMailedToUser} />
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setKycDialog({
                        userId: u.userId,
                        name: u?.name || "User",
                        currentValue: Boolean(u?.kycUpdatedByAdmin),
                        selectedValue: Boolean(u?.kycUpdatedByAdmin),
                      })
                    }
                    className="rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE749]/60 focus-visible:ring-offset-2"
                    aria-label={`Update KYC status for ${u?.name || "user"}`}
                  >
                    <StatusBadge value={u?.kycUpdatedByAdmin} label="KYC done" />
                  </button>
                  <StatusBadge value={u?.invoiceMailedToUser} label="Invoice sent" />
                </div>

                <div className="mt-4">
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    disabled={sendingAgreementId === u._id}
                    onClick={() =>
                      setConfirmSendModal({
                        agreementId: u._id,
                        email: u.email,
                        name: u.name,
                      })
                    }
                  >
                    {sendingAgreementId === u._id ? "Sending…" : "Send Agreement"}
                  </AdminButton>
                </div>
              </article>
            ))}
          </div>
          {/* Desktop table (>= md) — the same shared AdminTable used everywhere */}
          <div className="hidden md:block">
            <AdminTable
              columns={columns}
              rows={pagedItems}
              minWidth={1800}
            />
          </div>

          {/* KYC status dialog — same PATCH call, now on the shared modal */}
          {kycDialog && (
            <AdminModal
              open
              onClose={() => setKycDialog(null)}
              title="Update KYC status"
              description={`User: ${kycDialog.name}`}
              maxWidth="max-w-md"
              footer={
                <AdminButton
                  variant="secondary"
                  onClick={() => setKycDialog(null)}
                >
                  Cancel
                </AdminButton>
              }
            >
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={updatingUserId === kycDialog.userId}
                  onClick={() =>
                    updateUserStatus(
                      kycDialog.userId,
                      "kycUpdatedByAdmin",
                      true,
                    )
                  }
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    kycDialog.selectedValue
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={updatingUserId === kycDialog.userId}
                  onClick={() =>
                    updateUserStatus(
                      kycDialog.userId,
                      "kycUpdatedByAdmin",
                      false,
                    )
                  }
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    !kycDialog.selectedValue
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  No
                </button>
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                Currently marked as{" "}
                <span className="font-semibold text-neutral-700">
                  {kycDialog.selectedValue ? "Yes" : "No"}
                </span>
                .
              </p>
            </AdminModal>
          )}

          {/* Result dialog (send-agreement outcome) */}
          {resultModal && (
            <AdminModal
              open
              onClose={() => setResultModal(null)}
              title={resultModal.type === "success" ? "Success" : "Error"}
              maxWidth="max-w-md"
              footer={
                <AdminButton
                  variant="secondary"
                  onClick={() => setResultModal(null)}
                >
                  Close
                </AdminButton>
              }
            >
              <div className="flex items-start gap-3">
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    resultModal.type === "success"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {resultModal.type === "success" ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <X className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
                <p
                  className={`text-sm ${
                    resultModal.type === "success"
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {resultModal.message}
                </p>
              </div>
            </AdminModal>
          )}
          {/* Confirm dialog for send-agreement (backdrop click disabled) */}
          {confirmSendModal && (
            <AdminModal
              open
              onClose={() => setConfirmSendModal(null)}
              title="Send agreement email"
              maxWidth="max-w-md"
              closeOnBackdrop={false}
              footer={
                <>
                  <AdminButton
                    variant="secondary"
                    onClick={() => setConfirmSendModal(null)}
                  >
                    Cancel
                  </AdminButton>
                  <AdminButton
                    variant="primary"
                    onClick={handleConfirmedSend}
                    disabled={
                      sendingAgreementId === confirmSendModal.agreementId
                    }
                  >
                    {sendingAgreementId === confirmSendModal.agreementId
                      ? "Sending…"
                      : "Send"}
                  </AdminButton>
                </>
              }
            >
              <p className="text-sm text-neutral-600">
                Are you sure you want to send the agreement to{" "}
                <span className="font-semibold text-neutral-900">
                  {confirmSendModal.email}
                </span>
                ?
              </p>
            </AdminModal>
          )}
        </>
      )}
    </AdminSection>
  );
}

/** Label/value pair used by the mobile card list. */
function MobileField({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="mt-0.5 truncate font-medium text-neutral-800">
        {children || "—"}
      </dd>
    </div>
  );
}