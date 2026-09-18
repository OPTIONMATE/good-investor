"use client";

import { useMemo, useState } from "react";
import { IdCard, MapPin, UserRound } from "lucide-react";
import AdminSection from "./ui/AdminSection";
import AdminTable from "./ui/AdminTable";
import AdminBadge from "./ui/AdminBadge";
import AdminEmptyState from "./ui/AdminEmptyState";
import AdminPagination from "./ui/AdminPagination";
import AdminButton from "./ui/AdminButton";
import AdminModal from "./ui/AdminModal";
import AdminSelect from "./ui/AdminSelect";
import { AdminToolbar } from "./ui/AdminToolbar";
import { usePagination } from "./ui/usePagination";

/**
 * RiskProfilesSection — /admin-dashboard/risk-profiles.
 *
 * Same `data` prop and same "View Profile" detail modal; now built from the
 * shared AdminSection / AdminTable / AdminBadge / AdminModal primitives with
 * the shared AdminPagination footer. A "Sort by" control (same AdminSelect
 * pattern as UsersSection) was added to the toolbar.
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

export default function RiskProfilesSection({ data }) {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  // Filter/sort signature -> page 1 whenever the sort changes.
  const sortedProfiles = useMemo(() => {
    const rows = [...(data || [])];

    rows.sort((a, b) => {
      if (sortBy === "name") {
        return String(a?.fullName || "").localeCompare(String(b?.fullName || ""));
      }

      if (sortBy === "email") {
        return String(a?.email || "").localeCompare(String(b?.email || ""));
      }

      if (sortBy === "state") {
        return String(a?.state || "").localeCompare(String(b?.state || ""));
      }

      // Default: newest submission first
      return (
        new Date(b?.createdAt || 0).getTime() -
        new Date(a?.createdAt || 0).getTime()
      );
    });

    return rows;
  }, [data, sortBy]);

  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    pagedItems,
    setPage,
    setPageSize,
  } = usePagination(sortedProfiles, DEFAULT_PAGE_SIZE, { resetKey: sortBy });

  if (!data || data.length === 0) {
    return (
      <AdminSection>
        <AdminEmptyState
          title="No risk profiles found"
          description="Risk profiling questionnaires will appear here once clients submit them."
        />
      </AdminSection>
    );
  }

  const columns = [
    {
      key: "user",
      header: "User",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
            <UserRound className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-neutral-900">
              {r.fullName || "User"}
            </p>
            <p className="truncate text-xs text-neutral-500">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "username",
      header: "Username",
      render: (r) => (
        <span className="text-sm text-neutral-600">
          {r.username ? `@${r.username}` : "—"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => (
        <span className="text-sm text-neutral-600">{r.phone || "—"}</span>
      ),
    },
    {
      key: "state",
      header: "State",
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-neutral-600">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden="true" />
          {r.state || "—"}
        </span>
      ),
    },
    {
      key: "pan",
      header: "PAN",
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-sm uppercase text-neutral-700">
          <IdCard className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden="true" />
          {r.panNumber || "—"}
        </span>
      ),
    },
    {
      key: "submitted",
      header: "Submitted",
      render: (r) => (
        <span className="text-sm text-neutral-600">{formatDate(r.createdAt)}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: () => <AdminBadge tone="accent">Profile</AdminBadge>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => setSelectedProfile(r)}
          aria-label={`View risk profile for ${r.fullName || r.email || "user"}`}
        >
          View Profile
        </AdminButton>
      ),
    },
  ];

  return (
    <>
      <AdminSection
        toolbar={
          <AdminToolbar
            actions={
              <span className="text-sm text-neutral-500">
                Total:{" "}
                <span className="font-semibold text-neutral-900">
                  {totalItems}
                </span>
              </span>
            }
          >
            <div className="w-full sm:w-52">
              <label
                htmlFor="admin-risk-sort"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Sort by
              </label>
              <AdminSelect
                id="admin-risk-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="state">State</option>
              </AdminSelect>
            </div>
          </AdminToolbar>
        }
        footer={
          <AdminPagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel={totalItems === 1 ? "risk profile" : "risk profiles"}
            emptyMessage="No risk profiles to display on this page."
          />
        }
      >
        <AdminTable columns={columns} rows={pagedItems} minWidth={1020} />
      </AdminSection>

      {selectedProfile && (
        <AdminModal
          open
          onClose={() => setSelectedProfile(null)}
          title="Risk profile details"
          description={selectedProfile.email}
          maxWidth="max-w-2xl"
          footer={
            <AdminButton
              variant="secondary"
              onClick={() => setSelectedProfile(null)}
            >
              Close
            </AdminButton>
          }
        >
          <RiskProfileDetails profile={selectedProfile} />
        </AdminModal>
      )}
    </>
  );
}

/** Detail body for the risk profile modal — same fields as before. */
function RiskProfileDetails({ profile }) {
  const answers =
    profile.answers && Object.keys(profile.answers).length > 0
      ? profile.answers
      : null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">
          User information
        </h3>
        <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ProfileField label="User ID">
            <span className="break-all">{profile._id}</span>
          </ProfileField>
          <ProfileField label="Full name">{profile.fullName || "N/A"}</ProfileField>
          <ProfileField label="Email">{profile.email || "N/A"}</ProfileField>
          <ProfileField label="Username">{profile.username || "N/A"}</ProfileField>
          <ProfileField label="Phone">{profile.phone || "N/A"}</ProfileField>
          <ProfileField label="Date of birth">{profile.dob || "N/A"}</ProfileField>
          <ProfileField label="Gender">{profile.gender || "N/A"}</ProfileField>
          <ProfileField label="State">{profile.state || "N/A"}</ProfileField>
          <ProfileField label="PAN number">{profile.panNumber || "N/A"}</ProfileField>
          <ProfileField label="Submitted date">
            {profile.createdAt
              ? new Date(profile.createdAt).toLocaleString("en-IN")
              : "N/A"}
          </ProfileField>
        </dl>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">
          Risk assessment answers
        </h3>
        {answers ? (
          <div className="mt-3 space-y-3">
            {Object.entries(answers).map(([key, value], idx) => (
              <div
                key={`${key}-${idx}`}
                className="rounded-lg border border-neutral-200 bg-white p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {key}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-900">
                  {typeof value === "object"
                    ? JSON.stringify(value, null, 2)
                    : String(value)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">
            No risk assessment data available
          </p>
        )}
      </div>
    </div>
  );
}

/** Label/value pair used inside the risk profile modal. */
function ProfileField({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-neutral-900">{children}</dd>
    </div>
  );
}