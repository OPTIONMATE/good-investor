"use client";

import { cn } from "@/app/lib/utils";

/**
 * AdminSection — single shared inner-section shell for the admin dashboard.
 *
 * Visual language extracted from Home + Services pages:
 * - Home `Cards` header: centred eyebrow (lime-600, uppercase, tracking-[0.35em])
 *   over a bold neutral-900 heading, section on plain white.
 * - Home `Blocks` / `RevealBento`: page wash `from-white via-[#f7f9ff] to-white`,
 *   cards `rounded-xl border slate-200/70 bg-white/90 shadow-[0_20px_60px_rgba(17,24,39,0.08)]`.
 * - Services `PlansSection`: shell `bg-linear-to-b from-white via-[#f6f9ff] to-white`,
 *   heading `font-black text-neutral-900` with gradient span
 *   `from-[#9BE749] to-[#6d5bff]`, info banner
 *   `bg-linear-to-r from-[#9BE749]/10 via-white to-[#6d5bff]/10 border-[#9BE749]/30 rounded-2xl`.
 * - Services `PlanCard`: `rounded-2xl`, popular ring `ring-[#9BE749]`,
 *   CTA `bg-[#9BE749] text-black rounded-xl`, badge gradient lime -> violet.
 *
 * This shell brings that language inside the dashboard WITHOUT touching the
 * outer AdminShell / sidebar / topbar:
 * - rounded-2xl white card, soft layered shadow, subtle top gradient wash
 * - optional eyebrow + title + description header (home/services style)
 * - toolbar slot (search / filters / export / refresh)
 * - body slot (tables / cards)
 * - footer slot (ONE shared AdminPagination lives here in every section)
 */
/**
 * SectionHeader — title + description + action slot for a section card.
 *
 * Home `Cards` eyebrow treatment (`text-xs tracking-[0.35em] text-lime-600
 * font-semibold uppercase`) over a bold neutral-900 heading, on the light
 * blue-white wash used by Services `PlansSection`
 * (`from-white via-[#f6f9ff] to-white`).
 */
export function SectionHeader({ eyebrow, title, description, actions }) {
  if (!eyebrow && !title && !description && !actions) return null;

  return (
    <div className="flex flex-col gap-3 border-b border-neutral-100 bg-linear-to-b from-white via-[#f6f9ff] to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-lime-600">
            {eyebrow}
          </p>
        )}
        {title && (
          <h2 className="truncate text-base font-bold tracking-tight text-neutral-900 sm:text-lg">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-0.5 max-w-2xl text-sm text-neutral-500">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export default function AdminSection({
  eyebrow,
  title,
  description,
  actions,
  toolbar,
  children,
  footer,
  className = "",
  bodyClassName = "p-4 sm:p-5",
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-neutral-200 bg-white",
        "shadow-[0_20px_60px_rgba(17,24,39,0.08)]",
        className,
      )}
    >
      {/* Subtle brand wash — services PlansSection gradient, kept very light
          so dense admin tables stay readable. */}
      <div
        aria-hidden="true"
        className="h-1 w-full bg-linear-to-r from-[#9BE749] via-[#9BE749]/40 to-[#6d5bff]/60"
      />
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />
      {toolbar && (
        <div className="border-b border-neutral-100 bg-white px-4 py-3 sm:px-5">{toolbar}</div>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer && (
        <div className="border-t border-neutral-100 bg-white px-4 py-3 sm:px-5">{footer}</div>
      )}
    </section>
  );
}
