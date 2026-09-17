"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2, Eye, EyeOff, Plus, Loader, X } from "lucide-react";
import CouponForm from "./CouponForm";
import { fetchWithCsrf } from "@/app/lib/csrfClient";
import AdminPagination from "./ui/AdminPagination";
import { usePagination } from "./ui/usePagination";

export default function CouponList() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { couponId, couponCode }

  // Shared pagination (client-side today; swap for API params later without
  // touching the UI — the footer uses the same AdminPagination as every section).
  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    pagedItems,
    setPage,
    setPageSize,
  } = usePagination(coupons, 10);

  // Fetch coupons on mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/coupons", {
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        setCoupons(result.data);
        setError("");
      } else {
        setError(result.message || "Failed to fetch coupons");
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError("Error loading coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    const normalizedCouponId = String(couponId || "").trim();

    if (!normalizedCouponId) {
      setError("Invalid coupon ID. Please refresh and try again.");
      return;
    }

    try {
      setDeleting(normalizedCouponId);
      setError("");
      setSuccess("");
      const response = await fetchWithCsrf(
        `/api/coupons/${encodeURIComponent(normalizedCouponId)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success) {
        if (result.archived && result.data) {
          setCoupons((prev) =>
            prev.map((c) =>
              String(c._id) === normalizedCouponId ? result.data : c
            )
          );
          setSuccess(result.message || "Coupon archived successfully");
        } else {
          setCoupons((prev) =>
            prev.filter((c) => String(c._id) !== normalizedCouponId)
          );
          setSuccess("Coupon deleted successfully");
        }
        setDeleteConfirm(null);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete coupon");
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
      setError("Error deleting coupon");
    } finally {
      setDeleting(null);
    }
  };

  const requestDeleteCoupon = (couponId, couponCode) => {
    setDeleteConfirm({ couponId, couponCode });
    setError("");
    setSuccess("");
  };

  const cancelDeleteCoupon = () => {
    if (deleting) return;
    setDeleteConfirm(null);
  };

  const confirmDeleteCoupon = async () => {
    if (!deleteConfirm?.couponId) return;
    await handleDeleteCoupon(deleteConfirm.couponId);
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const response = await fetchWithCsrf(`/api/coupons/${coupon._id}/status`, {
        method: "PATCH",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setCoupons((prev) =>
          prev.map((c) =>
            c._id === coupon._id ? { ...c, isActive: !c.isActive } : c
          )
        );
        setError("");
      } else {
        setError(result.message || "Failed to toggle coupon status");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      setError("Error toggling coupon status");
    }
  };

  const handleFormSubmit = (updatedCoupon) => {
    if (editingCoupon) {
      // Update existing coupon
      setCoupons((prev) =>
        prev.map((c) => (c._id === updatedCoupon._id ? updatedCoupon : c))
      );
    } else {
      // Add new coupon
      setCoupons((prev) => [updatedCoupon, ...prev]);
    }
    setShowForm(false);
    setEditingCoupon(null);
    fetchCoupons(); // Refresh to get latest data
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isMaxUsesReached = (coupon) => {
    if (!coupon.maxUses) return false;
    return coupon.usedCount >= coupon.maxUses;
  };

  if (showForm) {
    return (
      <CouponForm
        coupon={editingCoupon}
        onSubmit={handleFormSubmit}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-neutral-600 text-sm">
            Manage discount coupons and promotional codes
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCoupon(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-lime-500 to-lime-600 text-white font-semibold rounded-lg hover:from-lime-600 hover:to-lime-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center justify-between">
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="text-green-700 hover:text-green-900"
            aria-label="Dismiss success message"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader size={32} className="animate-spin mx-auto mb-2 text-lime-500" />
            <p className="text-neutral-600">Loading coupons...</p>
          </div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
          <p className="text-neutral-600 mb-4">No coupons created yet</p>
          <button
            type="button"
            onClick={() => {
              setEditingCoupon(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition"
          >
            Create First Coupon
          </button>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Usage
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Expires
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.map((coupon) => (
                  <tr
                    key={coupon._id}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition"
                  >
                    {/* Code */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900">
                          {coupon.code}
                        </span>
                        {isExpired(coupon.expiresAt) && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            Expired
                          </span>
                        )}
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-neutral-500 mt-1">
                          {coupon.description}
                        </p>
                      )}
                    </td>

                    {/* Discount */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-neutral-900">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : `₹${coupon.discountValue}`}
                      </span>
                      <span className="text-xs text-neutral-500 ml-2">
                        ({coupon.discountType})
                      </span>
                    </td>

                    {/* Usage */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900">
                        {coupon.usedCount} / {coupon.maxUses || "∞"}
                      </div>
                      {coupon.maxUses && (
                        <div className="w-24 bg-neutral-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full transition ${
                              isMaxUsesReached(coupon)
                                ? "bg-red-500"
                                : "bg-lime-500"
                            }`}
                            style={{
                              width: `${Math.min((coupon.usedCount / coupon.maxUses) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </td>

                    {/* Expires */}
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString(
                            "en-IN"
                          )
                        : "Never"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(coupon)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center justify-center gap-1 mx-auto ${
                          coupon.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                        }`}
                      >
                        {coupon.isActive ? (
                          <>
                            <Eye size={14} /> Active
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} /> Inactive
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => handleEditCoupon(coupon)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit coupon"
                        >
                          <Edit2 size={16} className="text-blue-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            requestDeleteCoupon(coupon._id, coupon.code)
                          }
                          disabled={deleting === coupon._id}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete coupon"
                        >
                          {deleting === coupon._id ? (
                            <Loader size={16} className="animate-spin text-red-600" />
                          ) : (
                            <Trash2 size={16} className="text-red-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shared pagination footer — same component, alignment and spacing as
          every other admin section */}
      {!loading && coupons.length > 0 && (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white px-4 py-3">
          <AdminPagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel={totalItems === 1 ? "coupon" : "coupons"}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Delete Coupon?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to delete coupon{" "}
                <span className="font-semibold">&quot;{deleteConfirm.couponCode}"</span>?
                If this coupon has usage history, it will be archived instead of permanently deleted.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={cancelDeleteCoupon}
                disabled={!!deleting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCoupon}
                disabled={!!deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader size={16} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>Delete Coupon</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
