"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";
import { cn } from "@/app/lib/utils";
import AdminSection from "./ui/AdminSection";
import AdminButton from "./ui/AdminButton";
import { AdminSkeletonTable } from "./ui/AdminSkeleton";

/**
 * ComplaintStatsSection — /admin-dashboard/complaints.
 *
 * SEBI-format complaint statistics editor. Its read-only twin is the public
 * /complaint-table page, which reads the same document.
 *
 * Data flow is unchanged: GET /api/admin/complaint-stats on mount, a single
 * POST on save through fetchWithCsrf.
 *
 * UI notes:
 * - Every table is `table-fixed` with a <colgroup> percentage grid, so all
 *   fields fit inside the card — no horizontal scrolling at any width.
 * - The Source / Month / Year column gets the largest share and is never
 *   squeezed; numeric columns are right-aligned with tabular numerals and
 *   shrink fluidly instead of pushing the table wider.
 * - Rows are keyed by index, never by the value being edited: keying a row by
 *   `row.month` remounted the row on each keystroke and dropped input focus.
 */

/**
 * Header cell chrome — wrapping only (never nowrap) and `overflow-wrap:
 * anywhere` so a long word can never widen or spill out of its column.
 */
const HEAD_CLASS =
  "align-bottom px-1 py-2 text-[11px] font-semibold uppercase leading-tight tracking-normal text-neutral-500 [overflow-wrap:anywhere] sm:px-2 sm:text-xs sm:tracking-wide";

/** Editable cell chrome — same look and lime focus ring as the shared AdminInput. */
const CELL_CLASS =
  "w-full min-w-0 rounded-lg border border-neutral-300 bg-white px-1.5 py-1.5 text-xs text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#9BE749] focus:ring-2 focus:ring-[#9BE749]/40 sm:px-2.5 sm:text-sm";

/** Monthly Complaint Receipt — one row per complaint source. */
const RECEIPT_COLUMNS = [
  { key: "pendingAtEndLastMonth", header: "Pending at end of last month" },
  { key: "received", header: "Received" },
  { key: "resolved", header: "Resolved" },
  { key: "totalPending", header: "Total pending" },
  { key: "pendingOver3Months", header: "Pending over 3 months" },
  { key: "avgResolutionDays", header: "Avg. resolution time (days)" },
];

/** Disposal trend columns, shared by the monthly and annual tables. */
const TREND_COLUMNS = (period) => [
  { key: "carriedForward", header: `Carried forward from previous ${period}` },
  { key: "received", header: "Received" },
  { key: "resolved", header: "Resolved" },
  { key: "pending", header: "Pending" },
];

const TREND_KEYS = ["carriedForward", "received", "resolved", "pending"];

/** Sum each key across all rows. */
const sumBy = (rows, keys) =>
  keys.reduce((totals, key) => {
    totals[key] = rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
    return totals;
  }, {});

/** Mean of a key across all rows, rounded to one decimal. */
const averageBy = (rows, key) =>
  rows.length
    ? Number(
        (
          rows.reduce((sum, row) => sum + Number(row[key] || 0), 0) / rows.length
        ).toFixed(1),
      )
    : 0;

/** One row object with every column key initialised to 0. */
const emptyRow = (fixed, keys) => {
  const row = { ...fixed };
  keys.forEach((key) => {
    row[key] = 0;
  });
  return row;
};

/** Safe starting point while the saved document is still loading. */
const buildEmptyStats = () => ({
  monthlyReceiptRows: [
    "Directly from Investors",
    "SEBI (SCORES)",
    "Other Sources (if any)",
  ].map((source) => emptyRow({ source }, RECEIPT_COLUMNS.map((c) => c.key))),
  monthlyTrends: [
    "April 2026",
    "March 2026",
    "February 2026",
    "Previous Monthly Complaint for this FY",
  ].map((month) => emptyRow({ month }, TREND_KEYS)),
  annualTrends: ["FY25-26", "FY24-25"].map((year) =>
    emptyRow({ year }, TREND_KEYS),
  ),
});

/**
 * StatsTable — one editable SEBI table.
 *
 * `table-fixed` plus the <colgroup> percentage grid keeps the table exactly as
 * wide as the card, so long headers wrap and the inputs narrow instead of
 * overflowing. The first column (Source / Month / Year) is the widest one, so
 * long values such as "Previous Monthly Complaint for this FY" stay readable.
 */
function StatsTable({
  title,
  firstColumnLabel,
  firstColumnKey,
  firstColumnPlaceholder,
  section,
  rows,
  columns,
  totals,
  onChange,
  firstColumnWidth = "28%",
}) {
  const cellPadding = "px-1 py-1.5 align-middle sm:px-2 sm:py-2";

  return (
    <AdminSection title={title} bodyClassName="p-2 sm:p-4">
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          <col style={{ width: firstColumnWidth }} />
          {columns.map((column) => (
            <col key={column.key} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50/80">
            <th scope="col" className={HEAD_CLASS}>
              {firstColumnLabel}
            </th>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(HEAD_CLASS, "text-right")}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${section}-${index}`}
              className="border-b border-neutral-100 last:border-b-0"
            >
              <td className={cellPadding}>
                <input
                  type="text"
                  className={CELL_CLASS}
                  placeholder={firstColumnPlaceholder}
                  aria-label={`${firstColumnLabel} ${index + 1}`}
                  value={row[firstColumnKey] ?? ""}
                  onChange={(e) =>
                    onChange(section, index, firstColumnKey, e.target.value)
                  }
                />
              </td>
              {columns.map((column) => (
                <td key={column.key} className={cellPadding}>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    className={cn(CELL_CLASS, "text-right tabular-nums")}
                    aria-label={`${column.header} — ${
                      row[firstColumnKey] || `row ${index + 1}`
                    }`}
                    value={row[column.key] ?? ""}
                    onChange={(e) =>
                      onChange(section, index, column.key, e.target.value)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-neutral-50/70 text-xs font-semibold text-neutral-900 sm:text-sm">
            <td className="px-1 py-2 sm:px-2 sm:py-2.5">Grand total</td>
            {columns.map((column) => (
              <td
                key={column.key}
                className="px-1 py-2 text-right tabular-nums sm:px-2 sm:py-2.5"
              >
                {totals[column.key] ?? 0}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </AdminSection>
  );
}

export default function ComplaintStatsSection() {
  const [stats, setStats] = useState(buildEmptyStats());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/complaint-stats");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load complaint stats");
        }
        setStats(data);
      } catch (err) {
        setError(err.message || "Unable to load complaint stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  /** Label keys stay strings; numeric keys become numbers (a cleared field stays ""). */
  const updateValue = (section, index, key, value) => {
    setStats((prev) => {
      const updated = { ...prev };
      updated[section] = [...updated[section]];
      updated[section][index] = {
        ...updated[section][index],
        [key]:
          key === "source" || key === "month" || key === "year"
            ? value
            : value === ""
              ? ""
              : Number(value),
      };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetchWithCsrf("/api/admin/complaint-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to save complaint stats");
      }
      setStats(result);
      setMessage("Complaint table values saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save complaint stats.");
    } finally {
      setSaving(false);
    }
  };

  // Row totals: counts are summed, the average resolution time stays an average.
  const receiptTotals = useMemo(
    () => ({
      ...sumBy(
        stats.monthlyReceiptRows,
        RECEIPT_COLUMNS.map((column) => column.key).filter(
          (key) => key !== "avgResolutionDays",
        ),
      ),
      avgResolutionDays: averageBy(
        stats.monthlyReceiptRows,
        "avgResolutionDays",
      ),
    }),
    [stats.monthlyReceiptRows],
  );

  const trendTotals = useMemo(
    () => sumBy(stats.monthlyTrends, TREND_KEYS),
    [stats.monthlyTrends],
  );

  const annualTotals = useMemo(
    () => sumBy(stats.annualTrends, TREND_KEYS),
    [stats.annualTrends],
  );

  if (loading) {
    return <AdminSkeletonTable rows={6} columns={5} />;
  }

  return (
    <div className="space-y-5">
      {/* Single action bar: the publish hint plus the one save action. */}
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-[0_20px_60px_rgba(17,24,39,0.06)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-sm text-neutral-500">
          Edit the counts below and save — the same values appear on the public
          Complaints Table page.
        </p>
        <AdminButton
          onClick={handleSave}
          disabled={saving}
          className="shrink-0 rounded-full px-5"
        >
          {saving ? "Saving..." : "Save values"}
        </AdminButton>
      </div>

      {message && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <StatsTable
        title="Monthly Complaint Receipt"
        firstColumnLabel="Source"
        firstColumnKey="source"
        firstColumnPlaceholder="e.g. Directly from Investors"
        section="monthlyReceiptRows"
        rows={stats.monthlyReceiptRows}
        columns={RECEIPT_COLUMNS}
        totals={receiptTotals}
        onChange={updateValue}
      />

      <StatsTable
        title="Trend of Monthly Disposal of Complaints"
        firstColumnLabel="Month"
        firstColumnKey="month"
        firstColumnPlaceholder="e.g. August 2026"
        section="monthlyTrends"
        rows={stats.monthlyTrends}
        columns={TREND_COLUMNS("month")}
        totals={trendTotals}
        onChange={updateValue}
        firstColumnWidth="34%"
      />

      <StatsTable
        title="Trend of Annual Disposal of Complaints"
        firstColumnLabel="Year"
        firstColumnKey="year"
        firstColumnPlaceholder="e.g. FY25-26"
        section="annualTrends"
        rows={stats.annualTrends}
        columns={TREND_COLUMNS("year")}
        totals={annualTotals}
        onChange={updateValue}
        firstColumnWidth="34%"
      />
    </div>
  );
}