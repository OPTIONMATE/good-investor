"use client";

export default function AdminStatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "neutral",
}) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-700",
    lime: "bg-[#9BE749]/20 text-lime-800",
    purple: "bg-purple-100 text-purple-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {label}
        </p>
        {Icon && (
          <span
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tones[tone] || tones.neutral}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-2 truncate text-2xl font-bold tracking-tight text-neutral-900">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
    </div>
  );
}