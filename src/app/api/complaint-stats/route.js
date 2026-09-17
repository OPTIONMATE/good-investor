import connectDB from "@/app/lib/db";
import ComplaintStats from "@/app/lib/models/ComplaintStats";

/**
 * PUBLIC, READ-ONLY complaint statistics.
 *
 * The "Complaints Table" page (/complaint-table) is a public SEBI-style
 * disclosure page — it is linked in the public navbar and is intentionally
 * readable by anonymous visitors and normal users alike (the admin editor
 * describes it as "the public Complaints Table page"). It therefore must not
 * call the admin-only endpoint /api/admin/complaint-stats, which is a separate
 * resource that additionally allows WRITES and stays strictly admin-only.
 *
 * This route exposes GET only — there is no POST/PUT/PATCH/DELETE handler, so
 * there is no write surface here at all. It performs no authentication because
 * the data it returns is the public disclosure table (aggregate complaint
 * counts only — no user data, no PII, no financial data), and it does not
 * create or modify documents.
 */

// Canonical empty table shown until an admin publishes real values.
// Mirrors the seed data used by the admin editor so the public page always
// renders its full set of rows/labels instead of an empty shell.
const DEFAULT_STATS = {
  reportingMonth: "April 2026",
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
    { month: "April 2026", carriedForward: 0, received: 0, resolved: 0, pending: 0 },
    { month: "March 2026", carriedForward: 0, received: 0, resolved: 0, pending: 0 },
    { month: "February 2026", carriedForward: 0, received: 0, resolved: 0, pending: 0 },
    {
      month: "Previous Monthly Complaint for this FY",
      carriedForward: 0,
      received: 0,
      resolved: 0,
      pending: 0,
    },
  ],
  annualTrends: [
    { year: "FY25-26", carriedForward: 0, received: 0, resolved: 0, pending: 0 },
    { year: "FY24-25", carriedForward: 0, received: 0, resolved: 0, pending: 0 },
  ],
};

export async function GET() {
  try {
    await connectDB();

    // Read-only: never creates or updates the document.
    const stats = await ComplaintStats.findOne().lean();

    return new Response(JSON.stringify(stats || DEFAULT_STATS), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Public complaint stats error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load complaint stats" }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
