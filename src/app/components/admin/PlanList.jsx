"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2, Eye, EyeOff, Plus, Loader, X } from "lucide-react";
import PlanForm from "./PlanForm";
import { fetchWithCsrf } from "@/app/lib/csrfClient";
import AdminPagination from "./ui/AdminPagination";
import { usePagination } from "./ui/usePagination";

export default function PlanList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // {planId, planName}

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
  } = usePagination(plans, 10);

  // Fetch plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/plans", {
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        setPlans(result.data);
        setError("");
      } else {
        setError(result.message || "Failed to fetch plans");
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError("Error loading plans");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId, planName) => {
    setDeleteConfirm({ planId, planName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setDeleting(deleteConfirm.planId);
      setError("");
      setSuccess("");

      const response = await fetchWithCsrf(`/api/plans/${deleteConfirm.planId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setPlans((prev) => prev.filter((p) => p._id !== deleteConfirm.planId));
        setSuccess(`Plan "${deleteConfirm.planName}" deleted successfully!`);
        setDeleteConfirm(null);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete plan");
      }
    } catch (err) {
      console.error("Error deleting plan:", err);
      setError("Error deleting plan. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleToggleStatus = async (plan) => {
    try {
      const response = await fetchWithCsrf(`/api/plans/${plan._id}/status`, {
        method: "PATCH",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setPlans((prev) =>
          prev.map((p) =>
            p._id === plan._id ? { ...p, isActive: !p.isActive } : p
          )
        );
        setError("");
      } else {
        setError(result.message || "Failed to toggle plan status");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      setError("Error toggling plan status");
    }
  };

  const handleFormSubmit = (updatedPlan) => {
    if (editingPlan) {
      // Update existing plan
      setPlans((prev) =>
        prev.map((p) => (p._id === updatedPlan._id ? updatedPlan : p))
      );
    } else {
      // Add new plan
      setPlans((prev) => [updatedPlan, ...prev]);
    }
    setShowForm(false);
    setEditingPlan(null);
    fetchPlans(); // Refresh to get latest data
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  if (showForm) {
    return (
      <PlanForm
        plan={editingPlan}
        onSubmit={handleFormSubmit}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        
        <button
          type="button"
          onClick={() => {
            setEditingPlan(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-lime-500 to-lime-600 text-white font-semibold rounded-lg hover:from-lime-600 hover:to-lime-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} /> Create Plan
        </button>
      </div>

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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader size={32} className="animate-spin mx-auto mb-2 text-lime-500" />
            <p className="text-neutral-600">Loading plans...</p>
          </div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-lg border border-neutral-200">
          <p className="text-neutral-600 mb-4">No plans created yet</p>
          <button
            type="button"
            onClick={() => {
              setEditingPlan(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} /> Create First Plan
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">
                  Features
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.map((plan) => (
                <tr
                  key={plan._id}
                  className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {plan.name}
                      </p>
                      {plan.description && (
                        <p className="text-xs text-neutral-600 truncate">
                          {plan.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-lime-100 text-lime-700 text-xs font-semibold rounded-full">
                      {plan.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-neutral-900">
                    ₹{plan.price.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 text-neutral-700">
                    {plan.duration} days
                  </td>
                  <td className="px-6 py-4 text-neutral-700">
                    <span className="text-sm">{plan.features.length} items</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(plan)}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        plan.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                      }`}
                    >
                      {plan.isActive ? (
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditPlan(plan)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit plan"
                      >
                        <Edit2 size={16} className="text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(plan._id, plan.name)}
                        disabled={deleting === plan._id}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete plan"
                      >
                        {deleting === plan._id ? (
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
      )}

      {/* Shared pagination footer — same component, alignment and spacing as
          every other admin section */}
      {!loading && plans.length > 0 && (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white px-4 py-3">
          <AdminPagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel={totalItems === 1 ? "plan" : "plans"}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Delete Plan?
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to delete <span className="font-semibold">"{deleteConfirm.planName}"</span>? This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader size={16} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>Delete Plan</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
