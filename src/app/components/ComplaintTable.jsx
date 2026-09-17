"use client";

import { useEffect, useMemo, useState } from "react";

export default function ComplaintTable() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Public read-only disclosure endpoint. This page is public (linked in
        // the public navbar), so it must not call the admin-only resource.
        const res = await fetch("/api/complaint-stats");
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

    loadStats();
  }, []);

  const receiptTotals = useMemo(() => {
    if (!stats) return {};
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
  }, [stats]);

  const trendTotals = useMemo(() => {
    if (!stats)
      return { carriedForward: 0, received: 0, resolved: 0, pending: 0 };
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
  }, [stats]);

  const annualTotals = useMemo(() => {
    if (!stats)
      return { carriedForward: 0, received: 0, resolved: 0, pending: 0 };
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
  }, [stats]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 py-24">
        <div className="text-neutral-600">Loading complaint table data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 py-24">
        <div className="rounded-3xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-red-700">
            Unable to load complaint data
          </p>
          <p className="mt-2 text-sm text-neutral-600">{error}</p>
        </div>
      </div>
    );
  }

  const reportingMonth =
    stats.reportingMonth || stats.monthlyTrends?.[0]?.month || "current month";

  return (
    <div className="min-h-screen bg-slate-50 text-neutral-900">
      <div className="relative overflow-hidden bg-black/70 py-24">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at top left, rgba(156,231,73,0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(34,197,94,0.18), transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 text-center text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-lime-300">
            Complaints
          </p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">
            Complaint Table
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-10">
        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b bg-neutral-50 px-6 py-4">
            <h2 className="text-xl font-semibold text-neutral-900">
              Data for the Month Ending {reportingMonth}
            </h2>
            <p className="text-sm text-neutral-600">
              Complaint counts by source and overall resolution statistics.
            </p>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-neutral-200 text-sm">
              <caption className="sr-only">
                Complaint counts by source for the month ending {reportingMonth}.
              </caption>
              <thead className="bg-neutral-100 text-left text-neutral-700">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    S.No
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Received From
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pending at the end of last month
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Received
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Resolved
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Total Pending
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pending complaints &gt; 3 months
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Average resolution time (days)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {stats.monthlyReceiptRows.map((row, index) => (
                  <tr key={row.source} className="bg-white">
                    <td className="px-4 py-3 text-neutral-600">{index + 1}</td>
                    <th
                      scope="row"
                      className="px-4 py-3 font-semibold text-neutral-900"
                    >
                      {row.source}
                    </th>
                    <td className="px-4 py-3">{row.pendingAtEndLastMonth}</td>
                    <td className="px-4 py-3">{row.received}</td>
                    <td className="px-4 py-3">{row.resolved}</td>
                    <td className="px-4 py-3">{row.totalPending}</td>
                    <td className="px-4 py-3">{row.pendingOver3Months}</td>
                    <td className="px-4 py-3">{row.avgResolutionDays}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-semibold">
                  <td className="px-4 py-3">4</td>
                  <th scope="row" className="px-4 py-3 text-left">
                    Grand Total
                  </th>
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
          <div className="border-b bg-neutral-50 px-6 py-4">
            <h2 className="text-xl font-semibold text-neutral-900">
              Trend of Monthly Disposal of Complaints
            </h2>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-neutral-200 text-sm">
              <caption className="sr-only">
                Monthly trend of complaint disposal by month.
              </caption>
              <thead className="bg-neutral-100 text-left text-neutral-700">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    S.No
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Month
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Carried forward from the Previous Month
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Received
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Resolved
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pending
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {stats.monthlyTrends.map((row, index) => (
                  <tr key={row.month} className="bg-white">
                    <td className="px-4 py-3 text-neutral-600">{index + 1}</td>
                    <th
                      scope="row"
                      className="px-4 py-3 font-semibold text-neutral-900"
                    >
                      {row.month}
                    </th>
                    <td className="px-4 py-3">{row.carriedForward}</td>
                    <td className="px-4 py-3">{row.received}</td>
                    <td className="px-4 py-3">{row.resolved}</td>
                    <td className="px-4 py-3">{row.pending}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-semibold">
                  <td className="px-4 py-3">5</td>
                  <th scope="row" className="px-4 py-3 text-left">
                    Grand Total
                  </th>
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
          <div className="border-b bg-neutral-50 px-6 py-4">
            <h2 className="text-xl font-semibold text-neutral-900">
              Trend of Annual Disposal of Complaints
            </h2>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-neutral-200 text-sm">
              <caption className="sr-only">
                Annual trend of complaint disposal by year.
              </caption>
              <thead className="bg-neutral-100 text-left text-neutral-700">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    S.No
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Year
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Carried forward from the Previous Year
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Received
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Resolved
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pending
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {stats.annualTrends.map((row, index) => (
                  <tr key={row.year} className="bg-white">
                    <td className="px-4 py-3 text-neutral-600">{index + 1}</td>
                    <th
                      scope="row"
                      className="px-4 py-3 font-semibold text-neutral-900"
                    >
                      {row.year}
                    </th>
                    <td className="px-4 py-3">{row.carriedForward}</td>
                    <td className="px-4 py-3">{row.received}</td>
                    <td className="px-4 py-3">{row.resolved}</td>
                    <td className="px-4 py-3">{row.pending}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-semibold">
                  <td className="px-4 py-3">3</td>
                  <th scope="row" className="px-4 py-3 text-left">
                    Grand Total
                  </th>
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
