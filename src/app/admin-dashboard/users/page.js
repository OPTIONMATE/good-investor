"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import AdminPageHeader from "@/app/components/admin/ui/AdminPageHeader";
import AdminButton from "@/app/components/admin/ui/AdminButton";
import AdminErrorState from "@/app/components/admin/ui/AdminErrorState";
import { AdminSkeletonTable } from "@/app/components/admin/ui/AdminSkeleton";
import UsersSection from "@/app/components/admin/UsersSection";

/**
 * /admin-dashboard/users — route shell only.
 *
 * Fetch/loading/error handling is unchanged (same `/api/admin/users` call and
 * the same `load()` used for refresh). The list itself now renders through the
 * shared `UsersSection`, which owns search/sort/CSV/pagination while reusing
 * the primitives from the admin UI kit.
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      setUsers(json.users || []);
    } catch (err) {
      console.error("Users load error:", err);
      setError(err.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="All registered user accounts on the platform."
        actions={
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </AdminButton>
        }
      />

      {loading && <AdminSkeletonTable rows={8} columns={6} />}

      {!loading && error && (
        <AdminErrorState
          title="Unable to load users"
          description="Something went wrong while loading this data."
          onRetry={load}
        />
      )}

      {!loading && !error && <UsersSection data={users} onRefresh={load} />}
    </div>
  );
}