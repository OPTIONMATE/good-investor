"use client";

import { X } from "lucide-react";

/**
 * Shared UI shell + design tokens for the service-buying flow.
 *
 * Every step of the purchase flow renders inside this shell so the whole flow
 * matches the Services page (/services → PlansSection + PlanCard) in colours,
 * typography, spacing, surfaces and button language.
 */

export const BUY_STEPS = [
  { id: 1, label: "Terms" },
  { id: 2, label: "Your Details" },
  { id: 3, label: "OTP" },
  { id: 4, label: "Agreement" },
  { id: 5, label: "Payment" },
];

// Resend cadence for the purchase OTP — same 60s cooldown as registration.
export const OTP_RESEND_COOLDOWN = 60;

// Inputs — same treatment as the registration form (components/AuthForm.jsx):
// rounded-xl, neutral border, lime focus ring. White surface on the white card
// so every box reads as an editable field, never as plain text; the
// stronger default border + light inner shadow give the boxes their outline
// even when the page holds explanatory copy around them.
export const buyInputClass =
  "w-full rounded-xl border border-neutral-300 bg-neutral-100/80 px-4 py-3 text-sm font-medium text-neutral-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] outline-none transition placeholder:font-normal placeholder:text-neutral-400 hover:border-neutral-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-200 disabled:cursor-not-allowed disabled:bg-neutral-100";

export const buyLabelClass = "text-sm font-semibold text-neutral-800";

// Primary CTA — the Services page button language (PlanCard CTA).
export const buyPrimaryButtonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#9BE749] px-6 py-3 text-sm font-semibold text-black shadow-lg transition hover:bg-[#7dd938] hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/70 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none sm:w-auto";

// Secondary CTA — neutral surface, visually subordinate to the primary action.
export const buySecondaryButtonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/70 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

export const buyErrorClass =
  "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700";

export const buySuccessClass =
  "rounded-xl border border-[#9BE749]/40 bg-[#9BE749]/10 px-4 py-3 text-sm font-medium text-[#3f6d13]";

export const buyInfoClass =
  "rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600";

export function BuySectionHeading({ children, description }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-bold text-neutral-900">{children}</h3>
      {description && (
        <p className="mt-1 text-sm text-neutral-600">{description}</p>
      )}
    </div>
  );
}

export function BuyField({
  label,
  htmlFor,
  hint,
  error,
  filled,
  badge,
  children,
  className = "",
}) {
  // `filled` (boolean) and `badge` ("Saved" string) are aliases — the details
  // form passes `badge={savedBadgeFor(...)}` while older call sites may pass
  // `filled`. Either one marks a pre-filled-but-editable value.
  const badgeLabel =
    typeof badge === "string" && badge.length > 0
      ? badge
      : filled
        ? "Saved"
        : "";
  return (
    <div className={className}>
      <div className="mb-2 flex items-center gap-2">
        <label htmlFor={htmlFor} className={`block ${buyLabelClass}`}>
          {label}
        </label>
        
      </div>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-neutral-500">{hint}</p>
      )}
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Step indicator. On small screens it collapses to a "Step n of m" label plus a
 * progress bar so it never overflows; from `sm` upwards the full numbered
 * stepper is shown.
 */
export function BuyStepIndicator({ current }) {
  const activeStep =
    BUY_STEPS.find((step) => step.id === current) ?? BUY_STEPS[0];
  const progress = (activeStep.id / BUY_STEPS.length) * 100;

  return (
    <nav aria-label="Purchase progress">
      <div className="sm:hidden">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
          Step {activeStep.id} of {BUY_STEPS.length}
          <span className="px-1.5 text-neutral-300">|</span>
          <span className="text-neutral-900">{activeStep.label}</span>
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-[#9BE749] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ol className="hidden flex-wrap items-center gap-x-2 gap-y-2 sm:flex">
        {BUY_STEPS.map((step, index) => {
          const isDone = step.id < activeStep.id;
          const isCurrent = step.id === activeStep.id;
          return (
            <li
              key={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className="flex items-center gap-x-2"
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  isDone
                    ? "bg-[#9BE749] text-black"
                    : isCurrent
                      ? "bg-[#9BE749]/15 text-[#3f6d13] ring-1 ring-[#9BE749]"
                      : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {isDone ? "✓" : step.id}
              </span>
              <span
                className={`text-xs font-semibold ${
                  isCurrent ? "text-neutral-900" : "text-neutral-500"
                }`}
              >
                {step.label}
              </span>
              {index < BUY_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden h-px w-5 bg-neutral-200 lg:block"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Action row used by every step so primary / secondary buttons always sit in
 * the same place (stacked, primary first, on mobile; right-aligned on desktop).
 */
export function BuyActions({ children }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
      {children}
    </div>
  );
}

/**
 * Modal panel shared by every step of the purchase flow: plan summary header,
 * step indicator, scrollable content area and a close action.
 */
export default function BuyFlowShell({
  title,
  subtitle,
  step,
  onClose,
  planData,
  children,
  maxWidth = "max-w-3xl",
}) {
  const planPrice = Number(
    String(planData?.price ?? "").replace(/[^\d.]/g, ""),
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-6">
      <div className="flex min-h-full items-start justify-center sm:items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-flow-title"
          className={`relative w-full ${maxWidth} overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              {planData?.planName && (
                <p className="truncate text-xs font-bold uppercase tracking-wide text-neutral-500">
                  {planData.planName}
                  {Number.isFinite(planPrice) && planPrice > 0
                    ? ` · ₹${planPrice.toLocaleString("en-IN")}`
                    : ""}
                </p>
              )}
              <h2
                id="buy-flow-title"
                className="text-lg font-bold text-neutral-900 sm:text-xl"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close purchase flow"
              className="shrink-0 cursor-pointer rounded-full border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/70"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3 sm:px-6">
            <BuyStepIndicator current={step} />
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}