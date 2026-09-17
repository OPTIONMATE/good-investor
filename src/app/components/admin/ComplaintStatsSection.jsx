"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";

const buildEmptyStats = () => ({
  monthlyReceiptRows: [
    {
      source: "Directly from Investors",
      pendingAtEndLastMonth: 0,
      received: 0,
      resolved: 0,
      totalPending: 0,
      pendingOver3Months: 0,
      avgResolutionDays: 0,
    },
    {
      source: "SEBI (SCORES)",
      pendingAtEndLastMonth: 0,
      received: 0,
      resolved: 0,
      totalPending: 0,
      pendingOver3Months: 0,
      avgResolutionDays: 0,
    },
    {
      source: "Other Sources (if any)",
      pendingAtEndLastMonth: 0,
      received: 0,
      resolved: 0,
      totalPending: 0,
      pendingOver3Months: 0,
      avgResolutionDays: 0,
    },
  ],
  monthlyTrends: [
    {
      month: "April 2026",
      carriedForward: 0,
      received: 0,
      resolved: 0,
      pending: 0,
    },
    {
      month: "March 2026",
      carriedForward: 0,
      received: 0,
      resolved: 0,
      pending: 0,
    },
    {
      month: "February 2026",
      carriedForward: 0,
      received: 0,
      resolved: 0,
      pending: 0,
    },
    {
      month: "Previous Monthly Complaint for this FY",
      carriedForward: 0,
      received: 0,
      resolved: 0,
      pending: 0,
    },
  ],
  annualTrends: [
    {
      year: "FY25-26",
      carriedForward: 0,
      received: 0,
      resolved: 0,
      pending: 0,
    },
    {
      year: "FY24-25",
      carriedForward: 0,
      received: 0,
      resolved: 0,
      pending: 0,
    },
  ],
});

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

  const receiptTotals = useMemo(() => {
    const base = stats.monthlyReceiptRows.reduce(
      (acc, row) => {
        acc.pendingAtEndLastMonth += Number(row.pendingAtEndLastMonth || 0);
        acc.received += Number(row.received || 0);
        acc.resolved += Number(row.resolved || 0);
        acc.totalPending += Number(row.totalPending || 0);
        acc.pendingOver3Months += Number(row.pendingOver3Months || 0);
        acc.avgResolutionDays += Number(row.avgResolutionDays || 0);
        return acc;
      },
      {
        pendingAtEndLastMonth: 0,
        received: 0,
        resolved: 0,
        totalPending: 0,
        pendingOver3Months: 0,
        avgResolutionDays: 0,
      },
    );
    return {
      ...base,
      avgResolutionDays: stats.monthlyReceiptRows.length
        ? Number(
            (base.avgResolutionDays / stats.monthlyReceiptRows.length).toFixed(
              1,
            ),
          )
        : 0,
    };
  }, [stats.monthlyReceiptRows]);

  const trendTotals = useMemo(() => {
    return stats.monthlyTrends.reduce(
      (acc, row) => {
        acc.carriedForward += Number(row.carriedForward || 0);
        acc.received += Number(row.received || 0);
        acc.resolved += Number(row.resolved || 0);
        acc.pending += Number(row.pending || 0);
        return acc;
      },
      { carriedForward: 0, received: 0, resolved: 0, pending: 0 },
    );
  }, [stats.monthlyTrends]);

  const annualTotals = useMemo(() => {
    return stats.annualTrends.reduce(
      (acc, row) => {
        acc.carriedForward += Number(row.carriedForward || 0);
        acc.received += Number(row.received || 0);
        acc.resolved += Number(row.resolved || 0);
        acc.pending += Number(row.pending || 0);
        return acc;
      },
      { carriedForward: 0, received: 0, resolved: 0, pending: 0 },
    );
  }, [stats.annualTrends]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-neutral-500">
          Loading complaint table editor...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-[#9BE749] px-5 py-3 text-sm font-semibold text-neutral-900 shadow hover:bg-lime-400 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Complaint Values"}
          </button>
        </div>

        {message && (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-8">
        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b px-6 py-4 bg-neutral-50">
            <h3 className="text-lg font-semibold text-neutral-900">
              Monthly Complaint Receipt
            </h3>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-neutral-100 text-neutral-700">
                  <th className="whitespace-nowrap px-4 py-3">Source</th>
                  <th className="whitespace-nowrap px-4 py-3">
                    Pending at end of last month
                  </th>
                  <th className="whitespace-nowrap px-4 py-3">Received</th>
                  <th className="whitespace-nowrap px-4 py-3">Resolved</th>
                  <th className="whitespace-nowrap px-4 py-3">Total Pending</th>
                  <th className="whitespace-nowrap px-4 py-3">
                    Pending complaints &gt; 3 months
                  </th>
                  <th className="whitespace-nowrap px-4 py-3">
                    Average resolution time (days)
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.monthlyReceiptRows.map((row, index) => (
                  <tr key={row.source} className="border-b border-neutral-200">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.source}
                        onChange={(e) =>
                          updateValue(
                            "monthlyReceiptRows",
                            index,
                            "source",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.pendingAtEndLastMonth ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "monthlyReceiptRows",
                            index,
                            "pendingAtEndLastMonth",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.received ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "monthlyReceiptRows",
                            index,
                            "received",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.resolved ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "monthlyReceiptRows",
                            index,
                            "resolved",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.totalPending ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "monthlyReceiptRows",
                            index,
                            "totalPending",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.pendingOver3Months ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "monthlyReceiptRows",
                            index,
                            "pendingOver3Months",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.avgResolutionDays ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "monthlyReceiptRows",
                            index,
                            "avgResolutionDays",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-neutral-50 font-semibold text-neutral-900">
                  <td className="px-4 py-3">Grand Total</td>
                  <td className="px-4 py-3">
                    {receiptTotals.pendingAtEndLastMonth}
                  </td>
                  <td className="px-4 py-3">{receiptTotals.received}</td>
                  <td className="px-4 py-3">{receiptTotals.resolved}</td>
                  <td className="px-4 py-3">{receiptTotals.totalPending}</td>
                  <td className="px-4 py-3">
                    {receiptTotals.pendingOver3Months}
                  </td>
                  <td className="px-4 py-3">
                    {receiptTotals.avgResolutionDays}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b px-6 py-4 bg-neutral-50">
            <h3 className="text-lg font-semibold text-neutral-900">
              Trend of Monthly Disposal of Complaints
            </h3>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-neutral-100 text-neutral-700">
                  <th className="whitespace-nowrap px-4 py-3">Month</th>
                  <th className="whitespace-nowrap px-4 py-3">
                    Carried forward from the Previous Month
                  </th>
                  <th className="whitespace-nowrap px-4 py-3">Received</th>
                  <th className="whitespace-nowrap px-4 py-3">Resolved</th>
                  <th className="whitespace-nowrap px-4 py-3">Pending</th>
                </tr>
              </thead>
              <tbody>
                {stats.monthlyTrends.map((row, index) => (
                  <tr key={row.month} className="border-b border-neutral-200">
                    <td className="px-4 py-3 w-56">
                      <input
                        type="text"
                        value={row.month}
                        onChange={(e) =>
                          updateValue(
                            "monthlyTrends",
                            index,
                            "month",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.carriedForward ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "monthlyTrends",
                            index,
                            "carriedForward",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.received ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "monthlyTrends",
                            index,
                            "received",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.resolved ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "monthlyTrends",
                            index,
                            "resolved",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.pending ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "monthlyTrends",
                            index,
                            "pending",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-neutral-50 font-semibold text-neutral-900">
                  <td className="px-4 py-3">Grand Total</td>
                  <td className="px-4 py-3">{trendTotals.carriedForward}</td>
                  <td className="px-4 py-3">{trendTotals.received}</td>
                  <td className="px-4 py-3">{trendTotals.resolved}</td>
                  <td className="px-4 py-3">{trendTotals.pending}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b px-6 py-4 bg-neutral-50">
            <h3 className="text-lg font-semibold text-neutral-900">
              Trend of Annual Disposal of Complaints
            </h3>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-neutral-100 text-neutral-700">
                  <th className="whitespace-nowrap px-4 py-3">Year</th>
                  <th className="whitespace-nowrap px-4 py-3">
                    Carried forward from the Previous Year
                  </th>
                  <th className="whitespace-nowrap px-4 py-3">Received</th>
                  <th className="whitespace-nowrap px-4 py-3">Resolved</th>
                  <th className="whitespace-nowrap px-4 py-3">Pending</th>
                </tr>
              </thead>
              <tbody>
                {stats.annualTrends.map((row, index) => (
                  <tr key={row.year} className="border-b border-neutral-200">
                    <td className="px-4 py-3 w-56">
                      <input
                        type="text"
                        value={row.year}
                        onChange={(e) =>
                          updateValue(
                            "annualTrends",
                            index,
                            "year",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.carriedForward ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "annualTrends",
                            index,
                            "carriedForward",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.received ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "annualTrends",
                            index,
                            "received",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.resolved ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "annualTrends",
                            index,
                            "resolved",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        value={row.pending ?? ""}
                        onChange={(e) =>
                          updateValue(
                            "annualTrends",
                            index,
                            "pending",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-neutral-50 font-semibold text-neutral-900">
                  <td className="px-4 py-3">Grand Total</td>
                  <td className="px-4 py-3">{annualTotals.carriedForward}</td>
                  <td className="px-4 py-3">{annualTotals.received}</td>
                  <td className="px-4 py-3">{annualTotals.resolved}</td>
                  <td className="px-4 py-3">{annualTotals.pending}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
