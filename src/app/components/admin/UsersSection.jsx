"use client";

import { useMemo, useState } from "react";
import {
  Download,
  UserRound,
  Mail,
  Phone,
  IdCard,
  Calendar,
  CircleCheck,
  Users,
} from "lucide-react";
import AdminSection from "./ui/AdminSection";
import AdminTable from "./ui/AdminTable";
import AdminBadge from "./ui/AdminBadge";
import AdminEmptyState from "./ui/AdminEmptyState";
import AdminPagination from "./ui/AdminPagination";
import AdminButton from "./ui/AdminButton";
import AdminSelect from "./ui/AdminSelect";
import { AdminSearchInput, AdminToolbar } from "./ui/AdminToolbar";
import { usePagination } from "./ui/usePagination";

/**
 * UsersSection — user directory for /admin-dashboard/users.
 *
 * Data + refresh come in through props (unchanged): `data` is the array
 * returned by `/api/admin/users`, `onRefresh` re-runs the parent fetch.
 * Filtering, sorting and CSV export behave exactly as before; the only
 * functional addition is the shared AdminPagination footer (client-side
 * slicing via usePagination, ready to move to server-side params later
 * without touching the UI).
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

const toSearchText = (user) =>
  [user?.fullName, user?.username, user?.email, user?.phone, user?.panNumber]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export default function UsersSection({ data = [], onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("joined");

  const filteredAndSortedUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = normalizedSearch
      ? data.filter((user) => toSearchText(user).includes(normalizedSearch))
      : [...data];

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        const aName = String(a?.fullName || a?.username || "").toLowerCase();
        const bName = String(b?.fullName || b?.username || "").toLowerCase();
        return aName.localeCompare(bName);
      }

      if (sortBy === "email") {
        const aEmail = String(a?.email || "").toLowerCase();
        const bEmail = String(b?.email || "").toLowerCase();
        return aEmail.localeCompare(bEmail);
      }

      // Default: newest first
      const aDate = new Date(a?.createdAt || 0).getTime();
      const bDate = new Date(b?.createdAt || 0).getTime();
      return bDate - aDate;
    });

    return filtered;
  }, [data, searchTerm, sortBy]);

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

  const exportUsersCsv = () => {
    const headers = [
      "Name",
      "Username",
      "Email",
      "Phone",
      "PAN Card",
      "Status",
      "Role",
      "Joined",
      "User ID",
    ];

    const rows = filteredAndSortedUsers.map((u) => [
      u?.fullName || "",
      u?.username || "",
      u?.email || "",
      u?.phone || "",
      u?.panNumber || "",
      u?.emailVerified ? "Verified" : "Pending",
      u?.role || "user",
      formatDate(u?.createdAt),
      u?._id || "",
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
    link.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("joined");
  };

  const columns = [
    {
      key: "user",
      header: "User",
      render: (u) => {
        const displayName = u?.fullName || u?.username || "Unnamed user";
        return (
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
              <UserRound className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-neutral-900">
                {displayName}
              </p>
              <span className="inline-flex rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-600">
                @{u?.username || String(u?._id || "").slice(-6)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "contact",
      header: "Contact",
      render: (u) => (
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-sm text-neutral-600">
            <Mail className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <span className="truncate">{u?.email || "N/A"}</span>
          </p>
          <p className="flex items-center gap-1.5 text-sm text-neutral-600">
            <Phone className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            {u?.phone || "N/A"}
          </p>
        </div>
      ),
    },
    {
      key: "dob",
      header: "Date of birth",
      render: (u) => (
        <span className="text-sm text-neutral-600">{u?.dob || "N/A"}</span>
      ),
    },
    {
      key: "pan",
      header: "PAN",
      render: (u) => (
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-neutral-700">
            <IdCard className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <span className="truncate">{u?.panNumber || "Not provided"}</span>
          </p>
          <AdminBadge
            tone={u?.panVerified ? "success" : "pending"}
            className="mt-1"
          >
            {u?.panVerified ? "Verified" : "Pending"}
          </AdminBadge>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) =>
        u?.emailVerified ? (
          <AdminBadge tone="success" dot>
            <CircleCheck className="h-3 w-3" aria-hidden="true" />
            Verified
          </AdminBadge>
        ) : (
          <AdminBadge tone="pending">Pending</AdminBadge>
        ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (u) => (
        <span className="flex items-center gap-1.5 text-sm text-neutral-600">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          {formatDate(u?.createdAt)}
        </span>
      ),
    },
  ];
  // No rows at all — the section shell still wraps one clean empty state.
  if (!data || data.length === 0) {
    return (
      <AdminSection bodyClassName="p-4 sm:p-5">
        <AdminEmptyState
          title="No users found"
          description="There are no user accounts yet."
          icon={Users}
          actionLabel={onRefresh ? "Refresh" : undefined}
          onAction={onRefresh}
        />
      </AdminSection>
    );
  }

  /** Shared section card: header → toolbar → table → shared pagination. */
  return (
    <AdminSection
      toolbar={
        <AdminToolbar
          actions={
            <>
              <span className="text-sm text-neutral-500">
                Total:{" "}
                <span className="font-semibold text-neutral-900">
                  {totalItems}
                </span>
              </span>
              <AdminButton
                variant="primary"
                size="sm"
                onClick={exportUsersCsv}
                disabled={filteredAndSortedUsers.length === 0}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Export CSV
              </AdminButton>
            </>
          }
        >
          <AdminSearchInput
            id="admin-users-search"
            label="Search users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm("")}
            placeholder="Name, email, phone, PAN…"
            className="sm:w-72"
          />
          <div className="w-full sm:w-52">
            <label
              htmlFor="admin-users-sort"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
            >
              Sort by
            </label>
            <AdminSelect
              id="admin-users-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="joined">Newest first</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </AdminSelect>
          </div>
        </AdminToolbar>
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
            itemLabel={totalItems === 1 ? "user" : "users"}
          />
        ) : null
      }
    >
      {totalItems === 0 ? (
        <AdminEmptyState
          title="No users found"
          description="There are no users matching the current filters."
          actionLabel="Clear filters"
          onAction={clearFilters}
          icon={Users}
        />
      ) : (
        <AdminTable columns={columns} rows={pagedItems} minWidth={880} />
      )}
    </AdminSection>
  );
}