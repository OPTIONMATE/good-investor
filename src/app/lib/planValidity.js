/**
 * planValidity.js
 * --------------------------------------------------------------------------
 * Single authoritative source for service/plan VALIDITY math used in the
 * purchase -> payment -> invoice flow.
 *
 * BUSINESS RULE (invoice spec — inclusive calendar days):
 *   startDate = payment completion date
 *   endDate   = startDate + (validityDays - 1) calendar days
 *   expiresAt = end of that last valid calendar day (exclusive boundary)
 *
 * Authoritative examples:
 *   7   days, paid 2026-09-11 -> ends 2026-09-17 (11..17 = 7 days, +6)
 *   15  days, paid 2026-09-11 -> ends 2026-09-25 (+14)
 *   30  days, paid 2026-09-11 -> ends 2026-10-10 (+29)
 *   90  days, paid 2026-09-11 -> ends 2026-12-09 (+89)
 *   180 days, paid 2026-09-11 -> ends 2027-03-09 (+179)
 *   365 days, paid 2026-09-11 -> ends 2027-09-10 (+364)
 *   30  days, paid 2026-01-30    -> ends 2026-02-28 (Feb boundary)
 *   15  days, paid 2026-12-25    -> ends 2027-01-08 (year boundary)
 *   30  days, paid 2028-02-15    -> ends 2028-03-15 (2028 is a leap year)
 *
 * DO NOT:
 *   - hardcode a default validity (e.g. 30 days) for unknown plans
 *   - treat 30 days as 1 calendar month
 *   - use month-based math (setMonth / +1 month) for day-based Plan.duration
 *   - trust any client-sent validity/duration/expiry
 *
 * All date arithmetic uses local-calendar Date#setDate(), which handles
 * month/year/leap boundaries and DST transitions without millisecond drift.
 */

/**
 * Resolve + validate the duration (in days) of a plan document.
 * Plan.duration is the SOURCE OF TRUTH; no client-sent value is used.
 *
 * @param {object|null|undefined} plan - lean plan document (or null)
 * @returns {number} positive integer number of validity days
 * @throws {Error} when the plan does not exist or its duration is invalid
 */
export function resolvePlanDurationDays(plan) {
  if (!plan || !plan._id) {
    throw new Error("Selected plan does not exist");
  }
  const duration = Number(plan.duration);
  if (!Number.isInteger(duration) || duration <= 0) {
    throw new Error("Selected plan has an invalid validity duration");
  }
  return duration;
}

/**
 * Normalise a payment-completion value into a valid start Date.
 *
 * @param {Date|string|number} paidAt - actual payment/purchase completion time
 * @returns {Date}
 * @throws {Error} when the value is not a valid date
 */
export function computeServiceStartDate(paidAt) {
  const start = new Date(paidAt);
  if (Number.isNaN(start.getTime())) {
    throw new Error("Invalid payment completion date");
  }
  return start;
}

/**
 * Final valid CALENDAR day for a day-based plan:
 * startDate + (durationDays - 1) days (local calendar).
 *
 * @param {Date} startDate
 * @param {number} durationDays - validated positive integer (days)
 * @returns {Date} local-calendar Date at the same time-of-day as startDate
 */
export function computeFinalServiceDate(startDate, durationDays) {
  const last = new Date(startDate);
  last.setDate(last.getDate() + durationDays - 1);
  return last;
}

/**
 * Invoice DISPLAY end date AND access-control expiry boundary.
 *
 * Returns the END of the final valid calendar day (local 23:59:59.999).
 * This single value has two clean properties:
 *   1. Every existing guard `expiresAt > new Date()` / `now < expiresAt`
 *      keeps access granted through the ENTIRE last valid day and drops it
 *      exactly at midnight after it (correct inclusive-day access).
 *   2. Any date-only view of this Date renders the same calendar day as the
 *      invoice's displayed end date (no off-by-one display drift).
 *
 * @param {Date} startDate
 * @param {number} durationDays - validated positive integer (days)
 * @returns {Date}
 */
export function computeServiceEndDate(startDate, durationDays) {
  const end = computeFinalServiceDate(startDate, durationDays);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Derive the purchased validity (days) for LEGACY records that predate the
 * Payment.planDuration / Invoice.planDuration snapshot fields.
 *
 * Uses ONLY stored historical timestamps (paidAt/expiresAt) — never the
 * current Plan configuration, never "today", never a 30-day default.
 *
 * Exactness contract: in non-DST server locales (e.g. Asia/Kolkata, UTC) the
 * old paidAt/expiresAt pairs were built with calendar setDate(+D), so
 * ceil(dateDiffDays) recovers D exactly. A DST fall-back transition (25-hour
 * day) or a paidAt landing exactly on 23:59:59.999 could otherwise yield D+1
 * or D-1. To guarantee we NEVER fabricate history, the candidate is
 * round-trip validated: computeFinalServiceDate(start, candidate) must land
 * on the same calendar day as the stored end. On mismatch this returns null
 * (caller renders "unknown") instead of a possibly-off-by-one value.
 *
 * Returns null when no reliable historical pair exists (caller must then
 * render "unknown", NOT invent a value).
 *
 * @param {Date|string|number} startValue - stored paidAt
 * @param {Date|string|number} endValue - stored expiresAt
 * @returns {number|null} positive integer days, or null
 */
export function derivePurchasedDurationDays(startValue, endValue) {
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  if (end.getTime() < start.getTime()) {
    return null;
  }
  const candidate = Math.ceil(
    (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (!Number.isInteger(candidate) || candidate <= 0) {
    return null;
  }
  // Round-trip validation: the candidate must reproduce the stored end's
  // calendar day via the same inclusive calendar-day rule used at purchase.
  const reconstructed = computeFinalServiceDate(start, candidate);
  if (
    reconstructed.getFullYear() !== end.getFullYear() ||
    reconstructed.getMonth() !== end.getMonth() ||
    reconstructed.getDate() !== end.getDate()
  ) {
    return null;
  }
  return candidate;
}

/**
 * Access-control expiry boundary persisted as Payment.expiresAt.
 * Same instant as the invoice's displayed end date (end of final valid day),
 * so every existing `expiresAt > now` comparison keeps the subscription
 * active through the last valid day without display drift.
 *
 * @param {Date} startDate
 * @param {number} durationDays
 * @returns {Date}
 */
export function computeServiceExpiry(startDate, durationDays) {
  return computeServiceEndDate(startDate, durationDays);
}