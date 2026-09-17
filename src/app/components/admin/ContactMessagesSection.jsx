"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  RefreshCw,
  Trash2,
  MailOpen,
  Mail,
  ChevronDown,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";
import AdminPagination from "@/app/components/admin/ui/AdminPagination";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const truncateText = (value, max = 18) => {
  const text = String(value || "");
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
};

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "in_progress":
      return "bg-blue-100 text-blue-700";
    case "resolved":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 border-red-300";
    case "medium":
      return "bg-amber-100 text-amber-700 border-amber-300";
    case "low":
      return "bg-green-100 text-green-700 border-green-300";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300";
  }
};

const SUBJECT_LABELS = {
  general: "General Inquiry",
  account: "Account Support",
  billing: "Billing & Pricing",
  feedback: "Feedback / Suggestions",
  other: "Other",
};

const SUBJECT_VALUES = ["general", "account", "billing", "feedback", "other"];

const formatSubject = (value) => SUBJECT_LABELS[value] || "—";

export default function ContactMessagesSection({ onUnreadCountChange }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [readStatus, setReadStatus] = useState("all");
  const [ticketStatus, setTicketStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [assignedTo, setAssignedTo] = useState("all");
  const [subject, setSubject] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [stats, setStats] = useState({ unreadCount: 0 });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState("");

  const fetchMessages = async (
    nextPage = page,
    nextSearch = search,
    nextReadStatus = readStatus,
    nextTicketStatus = ticketStatus,
    nextPriority = priority,
    nextAssignedTo = assignedTo,
    nextSubject = subject
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(nextPage),
        limit: "10",
        search: nextSearch,
        status: nextReadStatus,
        ticketStatus: nextTicketStatus,
        priority: nextPriority,
        assignedTo: nextAssignedTo,
        subject: nextSubject,
      });

      const response = await fetch(`/api/admin/contact-messages?${params.toString()}`, {
        credentials: "include",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to load messages");
        return;
      }

      setMessages(result.data || []);
      setPagination(result.pagination || {});
      setStats(result.stats || { unreadCount: 0 });
      if (typeof onUnreadCountChange === "function") {
        onUnreadCountChange(result.stats?.unreadCount || 0);
      }
    } catch {
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, readStatus, ticketStatus, priority, assignedTo, subject]);

  useEffect(() => {
    fetchMessages(
      page,
      debouncedSearch,
      readStatus,
      ticketStatus,
      priority,
      assignedTo,
      subject
    );
  }, [page, debouncedSearch, readStatus, ticketStatus, priority, assignedTo, subject]);

  const handleToggleRead = async (messageId, isRead) => {
    try {
      setActionLoading(messageId);
      const response = await fetchWithCsrf(
        `/api/admin/contact-messages/${encodeURIComponent(messageId)}/read`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ isRead: !isRead }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message || "Failed to update");
        return;
      }

      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isRead: !isRead } : m))
      );
      fetchMessages(page, debouncedSearch, readStatus, ticketStatus, priority, assignedTo, subject);
      setSuccess("Updated successfully");
    } catch {
      setError("Failed to update");
    } finally {
      setActionLoading("");
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      setActionLoading(messageId);
      const response = await fetchWithCsrf(
        `/api/admin/contact-messages/${encodeURIComponent(messageId)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message || "Failed to update status");
        return;
      }

      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, status: newStatus } : m))
      );
      setSuccess("Status updated");
      setEditingId(null);
    } catch {
      setError("Failed to update status");
    } finally {
      setActionLoading("");
    }
  };

  const handlePriorityChange = async (messageId, newPriority) => {
    try {
      setActionLoading(messageId);
      const response = await fetchWithCsrf(
        `/api/admin/contact-messages/${encodeURIComponent(messageId)}/priority`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ priority: newPriority }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message || "Failed to update priority");
        return;
      }

      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, priority: newPriority } : m))
      );
      setSuccess("Priority updated");
      setEditingId(null);
    } catch {
      setError("Failed to update priority");
    } finally {
      setActionLoading("");
    }
  };

  const handleAssignChange = async (messageId, newAssignee) => {
    try {
      setActionLoading(messageId);
      const response = await fetchWithCsrf(
        `/api/admin/contact-messages/${encodeURIComponent(messageId)}/assign`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ assignedTo: newAssignee }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message || "Failed to assign ticket");
        return;
      }

      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, assignedTo: newAssignee } : m))
      );
      setSuccess("Ticket assigned");
      setEditingId(null);
    } catch {
      setError("Failed to assign ticket");
    } finally {
      setActionLoading("");
    }
  };

  const handleNotesChange = async (messageId, newNotes) => {
    try {
      setActionLoading(messageId);
      const response = await fetchWithCsrf(
        `/api/admin/contact-messages/${encodeURIComponent(messageId)}/notes`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ notes: newNotes }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message || "Failed to update notes");
        return;
      }

      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, notes: newNotes } : m))
      );
      setSuccess("Notes updated");
      setEditingId(null);
    } catch {
      setError("Failed to update notes");
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      setActionLoading(messageId);
      const response = await fetchWithCsrf(
        `/api/admin/contact-messages/${encodeURIComponent(messageId)}`,
        { method: "DELETE" }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message || "Failed to delete");
        return;
      }

      const removed = messages.find((m) => m._id === messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      if (removed && !removed.isRead) {
        setStats((prev) => ({
          ...prev,
          unreadCount: Math.max((prev.unreadCount || 0) - 1, 0),
        }));
      }
      setSuccess("Message deleted");
    } catch {
      setError("Failed to delete");
    } finally {
      setActionLoading("");
    }
  };

  const startEdit = (messageId, field, currentValue) => {
    setEditingId(messageId);
    setEditField(field);
    setEditValue(currentValue || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditField(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editingId || !editField) return;

    if (editField === "status") {
      await handleStatusChange(editingId, editValue);
    } else if (editField === "priority") {
      await handlePriorityChange(editingId, editValue);
    } else if (editField === "assignedTo") {
      await handleAssignChange(editingId, editValue);
    } else if (editField === "notes") {
      await handleNotesChange(editingId, editValue);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-slate-600 text-sm mt-1">
            Total: <span className="font-semibold">{pagination.total || 0}</span> | Unread:{" "}
            <span className="font-semibold">{stats.unreadCount || 0}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            fetchMessages(
              page,
              debouncedSearch,
              readStatus,
              ticketStatus,
              priority,
              assignedTo,
              subject
            )
          }
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-white font-semibold hover:bg-emerald-600 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-slate-200 px-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select
            value={readStatus}
            onChange={(e) => setReadStatus(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="all">Read Status: All</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>

          <select
            value={ticketStatus}
            onChange={(e) => setTicketStatus(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="all">Status: All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="all">Priority: All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input
            type="text"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Filter by assignee..."
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="all">Subject: All</option>
            {SUBJECT_VALUES.map((value) => (
              <option key={value} value={value}>
                {SUBJECT_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">No messages found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800">
                    Reference ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800">
                    From
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr
                    key={m._id}
                    className={`border-b border-slate-100 hover:bg-slate-50/70 ${
                      m.priority === "high" ? "bg-red-50/30" : ""
                    } ${!m.isRead ? "bg-amber-50/40" : ""}`}
                  >
                    {/* Reference ID */}
                    <td
                      className="px-4 py-3 text-xs text-slate-700 font-mono"
                      title={m.referenceId || "N/A"}
                    >
                      {truncateText(m.referenceId || "N/A", 13)}
                    </td>

                    {/* From */}
                    <td className="px-4 py-3 text-xs text-slate-700">
                      <div>
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-slate-500">{m.email}</p>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="px-4 py-3 text-xs text-slate-700">
                      <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-sky-100 text-sky-700">
                        {formatSubject(m.subject)}
                      </span>
                    </td>

                    {/* Message */}
                    <td className="px-4 py-3 text-xs text-slate-700 max-w-xs">
                      <p className="line-clamp-2 whitespace-pre-wrap">{m.message}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {editingId === m._id && editField === "status" ? (
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-xs px-2 py-1 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer hover:opacity-80 ${getStatusColor(
                            m.status
                          )}`}
                          onClick={() =>
                            startEdit(m._id, "status", m.status)
                          }
                          title="Click to edit"
                        >
                          {m.status.replace("_", " ")}
                        </span>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3">
                      {editingId === m._id && editField === "priority" ? (
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-xs px-2 py-1 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold border cursor-pointer hover:opacity-80 ${getPriorityColor(
                            m.priority
                          )}`}
                          onClick={() =>
                            startEdit(m._id, "priority", m.priority)
                          }
                          title="Click to edit"
                        >
                          {m.priority}
                        </span>
                      )}
                    </td>

                    {/* Assigned To */}
                    <td className="px-4 py-3 text-xs text-slate-700 max-w-xs">
                      {editingId === m._id && editField === "assignedTo" ? (
                        <input
                          type="email"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="admin@example.com"
                          className="w-full text-xs px-2 py-1 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        />
                      ) : (
                        <p
                          className="cursor-pointer hover:bg-slate-100 p-1 rounded"
                          onClick={() =>
                            startEdit(m._id, "assignedTo", m.assignedTo)
                          }
                          title="Click to edit"
                        >
                          {m.assignedTo ? (
                            <span className="font-semibold">{truncateText(m.assignedTo, 18)}</span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </p>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-3 text-xs text-slate-700 max-w-xs">
                      {editingId === m._id && editField === "notes" ? (
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Add internal notes..."
                          maxLength={3000}
                          rows={2}
                          className="w-full text-xs px-2 py-1 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        />
                      ) : (
                        <p
                          className="line-clamp-2 cursor-pointer hover:bg-slate-100 p-1 rounded"
                          onClick={() => startEdit(m._id, "notes", m.notes)}
                          title="Click to edit"
                        >
                          {m.notes ? (
                            <span>{truncateText(m.notes, 25)}</span>
                          ) : (
                            <span className="text-slate-400 italic">No notes</span>
                          )}
                        </p>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatDateTime(m.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {editingId === m._id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={actionLoading === m._id}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={actionLoading === m._id}
                            className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleRead(m._id, m.isRead)
                            }
                            disabled={actionLoading === m._id}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                            title={m.isRead ? "Mark unread" : "Mark read"}
                          >
                            {m.isRead ? (
                              <Mail className="w-3 h-3" />
                            ) : (
                              <MailOpen className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(m._id)
                            }
                            disabled={actionLoading === m._id}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination — the shared admin control. This endpoint is already
          server-side paginated (`?page=&limit=`), so the values the API
          returned are passed straight through. */}
      {(pagination.total || 0) > 0 && (
        <AdminPagination
          page={pagination.page || page}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.total || 0}
          pageSize={pagination.limit || 10}
          onPageChange={setPage}
          disabled={loading}
          itemLabel="messages"
          emptyMessage="No messages to display on this page."
        />
      )}
    </div>
  );
}
