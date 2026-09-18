"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  RefreshCw,
  Trash2,
  MailOpen,
  Mail,
  Check,
  X,
  Eye,
  Inbox,
  Pencil,
} from "lucide-react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";
import AdminPagination from "@/app/components/admin/ui/AdminPagination";
import AdminSection from "@/app/components/admin/ui/AdminSection";
import AdminTable from "@/app/components/admin/ui/AdminTable";
import AdminBadge from "@/app/components/admin/ui/AdminBadge";
import AdminEmptyState from "@/app/components/admin/ui/AdminEmptyState";
import AdminModal from "@/app/components/admin/ui/AdminModal";
import AdminButton from "@/app/components/admin/ui/AdminButton";
import AdminSelect from "@/app/components/admin/ui/AdminSelect";
import {
  AdminSearchInput,
  AdminToolbar,
  AdminToolbarField,
} from "@/app/components/admin/ui/AdminToolbar";

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
  return `${text.slice(0, max)}…`;
};

const STATUS_BADGE_TONE = {
  pending: "warning",
  in_progress: "info",
  resolved: "success",
  rejected: "danger",
};

const PRIORITY_BADGE_TONE = {
  high: "danger",
  medium: "warning",
  low: "success",
};

const formatStatusLabel = (status) => String(status || "—").replace(/_/g, " ");

const SUBJECT_LABELS = {
  general: "General Inquiry",
  account: "Account Support",
  billing: "Billing & Pricing",
  feedback: "Feedback / Suggestions",
  other: "Other",
};

const SUBJECT_VALUES = ["general", "account", "billing", "feedback", "other"];

const formatSubject = (value) => SUBJECT_LABELS[value] || "—";

const MESSAGE_PREVIEW_LENGTH = 110;

const truncatePreview = (value, max = MESSAGE_PREVIEW_LENGTH) => {
  const text = String(value || "");
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
};

/* YouTube-style hover preview for the Message column. Rendered via portal
   so it is never clipped by the table's horizontal scroll container. */
function MessageHoverPreview({ anchorRef, text }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const update = () => {
      const el = anchorRef?.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 24);
      const gap = 8;
      const estHeight = 220;
      const openUp = r.bottom + gap + estHeight > window.innerHeight && r.top - gap - estHeight > 8;
      setPos({
        left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)),
        top: openUp ? undefined : r.bottom + gap,
        bottom: openUp ? window.innerHeight - r.top + gap : undefined,
        width,
        openUp,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef]);

  if (!pos) return null;

  return createPortal(
    <div
      role="tooltip"
      style={{
        position: "fixed",
        left: pos.left,
        ...(pos.openUp ? { bottom: pos.bottom } : { top: pos.top }),
        width: pos.width,
        zIndex: 80,
      }}
      className="rounded-lg border border-neutral-200 bg-white p-3 text-xs leading-5 text-neutral-700 shadow-lg"
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
        Full message
      </p>
      <p className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
        {text}
      </p>
    </div>,
    document.body
  );
}

/* Anchored floating card (popover) shared by the Manage cell. Fixed-positioned
   via portal so it never gets clipped by the table scroll container. */
function ManagePopover({
  anchorRef,
  title,
  subtitle,
  assignee,
  onAssigneeChange,
  notes,
  onNotesChange,
  saving,
  onClose,
  onSave,
}) {
  const [pos, setPos] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const el = anchorRef?.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.min(340, window.innerWidth - 24);
      const gap = 8;
      const estHeight = 270;
      const openUp = r.bottom + gap + estHeight > window.innerHeight && r.top - gap - estHeight > 8;
      setPos({
        left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)),
        top: openUp ? undefined : r.bottom + gap,
        bottom: openUp ? window.innerHeight - r.top + gap : undefined,
        width,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const onPointer = (e) => {
      const panel = panelRef.current;
      if (panel && !panel.contains(e.target) && !anchorRef?.current?.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [onClose, anchorRef]);

  useEffect(() => {
    panelRef.current?.querySelector("input, textarea")?.focus();
  }, []);

  if (!pos) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label={title}
      style={{
        position: "fixed",
        left: pos.left,
        ...(pos.bottom !== undefined ? { bottom: pos.bottom } : { top: pos.top }),
        width: pos.width,
        zIndex: 90,
      }}
      className="rounded-xl border border-neutral-200 bg-white shadow-xl"
    >
      <div className="border-b border-neutral-100 px-4 py-2.5">
        <p className="truncate text-sm font-semibold text-neutral-900">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-xs text-neutral-500">{subtitle}</p>}
      </div>
      <div className="space-y-3 px-4 py-3">
        <div>
          <label
            htmlFor="manage-popover-assignee"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
          >
            Assigned to
          </label>
          <input
            id="manage-popover-assignee"
            type="text"
            value={assignee}
            onChange={(e) => onAssigneeChange(e.target.value)}
            placeholder="admin@example.com"
            disabled={saving}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-[#9BE749] focus:ring-2 focus:ring-[#9BE749]/40 disabled:opacity-60"
          />
          <p className="mt-1 text-xs text-neutral-400">Leave empty to unassign.</p>
        </div>
        <div>
          <label
            htmlFor="manage-popover-notes"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
          >
            Internal notes
          </label>
          <textarea
            id="manage-popover-notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add context for the team — e.g. called back, waiting on docs…"
            maxLength={3000}
            rows={3}
            disabled={saving}
            className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm leading-6 text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-[#9BE749] focus:ring-2 focus:ring-[#9BE749]/40 disabled:opacity-60"
          />
          <p className="mt-0.5 text-right text-xs text-neutral-400">{notes.length}/3000</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-neutral-100 bg-neutral-50/60 px-4 py-2.5">
        <AdminButton variant="ghost" size="sm" onClick={onClose} disabled={saving}>
          Cancel
        </AdminButton>
        <AdminButton variant="primary" size="sm" onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Save
            </>
          )}
        </AdminButton>
      </div>
    </div>,
    document.body
  );
}

function MessageCell({ message, onViewFull }) {
  const full = String(message || "—");
  const isLong = full.length > MESSAGE_PREVIEW_LENGTH;
  const [hovering, setHovering] = useState(false);
  const anchorRef = useRef(null);
  const closeTimer = useRef(null);

  const open = () => {
    if (!isLong) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setHovering(true);
  };

  const close = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setHovering(false), 120);
  };

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  return (
    <div className="w-[280px] max-w-[280px]">
      <p
        ref={anchorRef}
        tabIndex={isLong ? 0 : undefined}
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        className="line-clamp-2 whitespace-pre-wrap break-words text-sm leading-5 text-neutral-700"
      >
        {truncatePreview(full)}
      </p>
      {isLong && hovering && (
        <MessageHoverPreview
          anchorRef={anchorRef}
          text={full}
        />
      )}
      {isLong && (
        <button
          type="button"
          onClick={onViewFull}
          onMouseEnter={open}
          className="mt-1 inline-flex items-center gap-1 rounded text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE749]/60"
        >
          <Eye className="h-3 w-3" aria-hidden="true" />
          View full
        </button>
      )}
    </div>
  );
}

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

  // Inline editing state (status / priority stay inline - small selects)
  const [editingId, setEditingId] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Floating-card editor for Assignee + Notes - roomy inputs instead of
  // cramped in-table fields. Anchored popover (portal) per row.
  const [manageTarget, setManageTarget] = useState(null);
  const [manageAssignee, setManageAssignee] = useState("");
  const [manageNotes, setManageNotes] = useState("");
  const [manageSaving, setManageSaving] = useState(false);
  const manageAnchorRef = useRef(null);

  const openManageCard = (message, anchorEl) => {
    if (anchorEl) manageAnchorRef.current = anchorEl;
    setManageTarget(message);
    setManageAssignee(message?.assignedTo || "");
    setManageNotes(message?.notes || "");
    setError("");
  };

  const closeManageCard = () => {
    if (manageSaving) return;
    setManageTarget(null);
    setManageAssignee("");
    setManageNotes("");
  };

  // Full-message reader (existing AdminModal) — keeps long enquiries
  // readable without stretching the table.
  const [viewingMessage, setViewingMessage] = useState(null);

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
    }
  };

  const saveManageCard = async () => {
    if (!manageTarget?._id || manageSaving) return;
    const messageId = manageTarget._id;
    const nextAssignee = manageAssignee.trim();
    const nextNotes = manageNotes.trim();
    const assigneeChanged = nextAssignee !== String(manageTarget.assignedTo || "");
    const notesChanged = nextNotes !== String(manageTarget.notes || "");
    if (!assigneeChanged && !notesChanged) {
      closeManageCard();
      return;
    }
    try {
      setManageSaving(true);
      setActionLoading(messageId);
      setError("");
      if (assigneeChanged) {
        const response = await fetchWithCsrf(
          `/api/admin/contact-messages/${encodeURIComponent(messageId)}/assign`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ assignedTo: nextAssignee }),
          }
        );
        const result = await response.json();
        if (!response.ok || !result.success) {
          setError(result.message || "Failed to assign ticket");
          return;
        }
      }
      if (notesChanged) {
        const response = await fetchWithCsrf(
          `/api/admin/contact-messages/${encodeURIComponent(messageId)}/notes`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ notes: nextNotes }),
          }
        );
        const result = await response.json();
        if (!response.ok || !result.success) {
          setError(result.message || "Failed to update notes");
          return;
        }
      }
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, assignedTo: nextAssignee, notes: nextNotes } : m
        )
      );
      if (viewingMessage?._id === messageId) {
        setViewingMessage((prev) =>
          prev ? { ...prev, assignedTo: nextAssignee, notes: nextNotes } : prev
        );
      }
      setManageTarget((prev) =>
        prev ? { ...prev, assignedTo: nextAssignee, notes: nextNotes } : prev
      );
      setSuccess("Assignee and notes updated");
      closeManageCard();
    } catch {
      setError("Failed to update assignee / notes");
    } finally {
      setManageSaving(false);
      setActionLoading("");
    }
  };

  const refresh = () =>
    fetchMessages(
      page,
      debouncedSearch,
      readStatus,
      ticketStatus,
      priority,
      assignedTo,
      subject
    );

  const clearFilters = () => {
    setSearch("");
    setReadStatus("all");
    setTicketStatus("all");
    setPriority("all");
    setAssignedTo("all");
    setSubject("all");
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    readStatus !== "all" ||
    ticketStatus !== "all" ||
    priority !== "all" ||
    assignedTo !== "all" ||
    subject !== "all";

  const editControlClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-xs text-neutral-900 outline-none transition focus:border-[#9BE749] focus:ring-2 focus:ring-[#9BE749]/40";

  const iconActionClass =
    "inline-flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE749]/60";

  const messageColumns = [
    {
      key: "from",
      header: "From",
      cellClassName: "align-top",
      render: (m) => (
        <div className="min-w-0 max-w-[200px]">
          <p className="truncate text-sm font-semibold text-neutral-900" title={m.name || "—"}>
            {m.name || "—"}
          </p>
          <p className="mt-0.5 truncate text-xs text-neutral-500" title={m.email || "—"}>
            {m.email || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "reference",
      header: "Reference",
      cellClassName: "align-top",
      render: (m) => (
        <span
          className="block max-w-[110px] truncate font-mono text-xs text-neutral-500"
          title={m.referenceId || "N/A"}
        >
          {truncateText(m.referenceId || "N/A", 13)}
        </span>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      cellClassName: "align-top",
      render: (m) => {
        const label = formatSubject(m.subject);
        return (
          <span
            className="block max-w-[170px] truncate text-sm text-neutral-700"
            title={label}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: "message",
      header: "Message",
      cellClassName: "align-top",
      render: (m) => (
        <MessageCell message={m.message} onViewFull={() => setViewingMessage(m)} />
      ),
    },
    {
      key: "status",
      header: "Status",
      cellClassName: "align-top",
      render: (m) =>
        editingId === m._id && editField === "status" ? (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={editControlClass}
            aria-label="Ticket status"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        ) : (
          <button
            type="button"
            onClick={() => startEdit(m._id, "status", m.status)}
            title="Click to change status"
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE749]/60"
          >
            <AdminBadge
              tone={STATUS_BADGE_TONE[m.status] || "neutral"}
              dot
              className="cursor-pointer capitalize hover:opacity-80"
            >
              {formatStatusLabel(m.status)}
            </AdminBadge>
          </button>
        ),
    },
    {
      key: "priority",
      header: "Priority",
      cellClassName: "align-top",
      render: (m) =>
        editingId === m._id && editField === "priority" ? (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={editControlClass}
            aria-label="Priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        ) : (
          <button
            type="button"
            onClick={() => startEdit(m._id, "priority", m.priority)}
            title="Click to change priority"
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE749]/60"
          >
            <AdminBadge
              tone={PRIORITY_BADGE_TONE[m.priority] || "neutral"}
              dot
              className="cursor-pointer capitalize hover:opacity-80"
            >
              {m.priority || "—"}
            </AdminBadge>
          </button>
        ),
    },
    {
      key: "assign",
      header: "Assign / Notes",
      cellClassName: "align-top",
      render: (m) => (
        <button
          type="button"
          onClick={(e) => openManageCard(m, e.currentTarget)}
          title="Click to assign or add notes"
          className="group block w-[180px] max-w-[180px] rounded-lg border border-neutral-200 px-2.5 py-2 text-left transition hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BE749]/60"
        >
          <span className="flex items-center gap-1.5">
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-800">
              {m.assignedTo || "Unassigned"}
            </span>
            <Pencil className="h-3 w-3 shrink-0 text-neutral-300 group-hover:text-neutral-500" aria-hidden="true" />
          </span>
          <span className="mt-1 block">
            {m.notes ? (
              <span className="line-clamp-2 block break-words text-xs text-neutral-500">
                {m.notes}
              </span>
            ) : (
              <span className="text-xs italic text-neutral-400">No notes — click to add</span>
            )}
          </span>
        </button>
      ),
    },
    {
      key: "date",
      header: "Date",
      cellClassName: "align-top whitespace-nowrap",
      render: (m) => (
        <span className="text-xs text-neutral-500" title={formatDateTime(m.createdAt)}>
          {formatDateTime(m.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cellClassName: "align-top",
      render: (m) =>
        editingId === m._id ? (
          <span className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={saveEdit}
              disabled={actionLoading === m._id}
              title="Save"
              aria-label="Save changes"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 transition hover:bg-emerald-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={actionLoading === m._id}
              title="Cancel"
              aria-label="Cancel editing"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/50"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewingMessage(m)}
              title="View full message"
              aria-label="View full message"
              className={iconActionClass}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => handleToggleRead(m._id, m.isRead)}
              disabled={actionLoading === m._id}
              title={m.isRead ? "Mark unread" : "Mark read"}
              aria-label={m.isRead ? "Mark unread" : "Mark read"}
              className={iconActionClass}
            >
              {m.isRead ? (
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <MailOpen className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(m._id)}
              disabled={actionLoading === m._id}
              title="Delete"
              aria-label="Delete message"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </span>
        ),
    },
  ];

  return (
    <AdminSection
      toolbar={
        <AdminToolbar
          actions={
            <>
              <span className="text-sm text-neutral-500">
                Total: <span className="font-semibold text-neutral-900">{pagination.total || 0}</span>
                {"  "}| Unread:{" "}
                <span className="font-semibold text-neutral-900">{stats.unreadCount || 0}</span>
              </span>
              <AdminButton variant="secondary" size="sm" onClick={refresh} disabled={loading}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Refresh
              </AdminButton>
              {hasActiveFilters && (
                <AdminButton variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear
                </AdminButton>
              )}
            </>
          }
        >
          <AdminSearchInput
            id="admin-messages-search"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            placeholder="Name, email, message…"
            className="sm:w-64"
          />
          <AdminToolbarField label="Read" htmlFor="admin-messages-read" width="w-full sm:w-36">
            <AdminSelect
              id="admin-messages-read"
              value={readStatus}
              onChange={(e) => setReadStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </AdminSelect>
          </AdminToolbarField>
          <AdminToolbarField label="Status" htmlFor="admin-messages-status" width="w-full sm:w-40">
            <AdminSelect
              id="admin-messages-status"
              value={ticketStatus}
              onChange={(e) => setTicketStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </AdminSelect>
          </AdminToolbarField>
          {/* __MORE_FILTERS__ */}
          <AdminToolbarField label="Priority" htmlFor="admin-messages-priority" width="w-full sm:w-36">
            <AdminSelect
              id="admin-messages-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </AdminSelect>
          </AdminToolbarField>
          <AdminToolbarField label="Assignee" htmlFor="admin-messages-assignee" width="w-full sm:w-44">
            <input
              id="admin-messages-assignee"
              type="text"
              value={assignedTo === "all" ? "" : assignedTo}
              onChange={(e) => setAssignedTo(e.target.value === "" ? "all" : e.target.value)}
              placeholder="Filter by assignee…"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-[#9BE749] focus:ring-2 focus:ring-[#9BE749]/40"
            />
          </AdminToolbarField>
          <AdminToolbarField label="Subject" htmlFor="admin-messages-subject" width="w-full sm:w-48">
            <AdminSelect
              id="admin-messages-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="all">All subjects</option>
              {SUBJECT_VALUES.map((value) => (
                <option key={value} value={value}>
                  {SUBJECT_LABELS[value]}
                </option>
              ))}
            </AdminSelect>
          </AdminToolbarField>
        </AdminToolbar>
      }
      footer={
        (pagination.total || 0) > 0 ? (
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
        ) : null
      }
    >
      {/* __SECTION_BODY__ */}
      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {loading ? (
        <AdminTable columns={messageColumns} rows={[]} loading loadingRows={8} minWidth={1180} />
      ) : messages.length === 0 ? (
        <AdminEmptyState
          title="No messages found"
          description={
            hasActiveFilters
              ? "No messages match the current filters. Try clearing them."
              : "There are no contact enquiries yet."
          }
          actionLabel={hasActiveFilters ? "Clear filters" : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
          icon={Inbox}
        />
      ) : (
        <AdminTable
          columns={messageColumns}
          rows={messages}
          getRowKey={(m) => m._id}
          minWidth={1180}
          rowClassName={(m) =>
            `${!m.isRead ? "bg-amber-50/40" : ""} ${m.priority === "high" ? "bg-red-50/20" : ""}`
          }
        />
      )}
      <p className="mt-3 text-xs text-neutral-400">
        Tip: hover a message for the full text, or click “View full” / the eye icon for a focused reader. Click Assign / Notes to edit both in one floating card.
      </p>

      {manageTarget && (
        <ManagePopover
          anchorRef={manageAnchorRef}
          title={`Assign · ${manageTarget.name || "Message"}`}
          subtitle={manageTarget.email || undefined}
          assignee={manageAssignee}
          onAssigneeChange={setManageAssignee}
          notes={manageNotes}
          onNotesChange={setManageNotes}
          saving={manageSaving}
          onClose={closeManageCard}
          onSave={saveManageCard}
        />
      )}

      {viewingMessage && (
        <AdminModal
          open
          onClose={() => setViewingMessage(null)}
          title={viewingMessage.name || "Message"}
          description={viewingMessage.email || undefined}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            {formatSubject(viewingMessage.subject)}
            {viewingMessage.referenceId ? ` · ${viewingMessage.referenceId}` : ""}
          </p>
          <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-neutral-800">
            {viewingMessage.message}
          </p>
          {viewingMessage.notes && (
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Internal notes
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-neutral-700">
                {viewingMessage.notes}
              </p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <AdminBadge tone={STATUS_BADGE_TONE[viewingMessage.status] || "neutral"} dot className="capitalize">
              {formatStatusLabel(viewingMessage.status)}
            </AdminBadge>
            <AdminBadge tone={PRIORITY_BADGE_TONE[viewingMessage.priority] || "neutral"} dot className="capitalize">
              {viewingMessage.priority || "—"} priority
            </AdminBadge>
            <span className="ml-auto text-xs text-neutral-500">
              {formatDateTime(viewingMessage.createdAt)}
            </span>
          </div>
        </AdminModal>
      )}
    </AdminSection>
  );
}
