"use client";

export default function AdminCard({
  title,
  description,
  children,
  actions,
  className = "",
  as: Tag = "div",
  ...rest
}) {
  return (
    <Tag
      className={`rounded-xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] ${className}`}
      {...rest}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title && (
              <h3 className="truncate text-sm font-semibold text-neutral-900">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </Tag>
  );
}