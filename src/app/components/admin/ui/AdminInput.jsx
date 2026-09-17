"use client";

export default function AdminInput({
  label,
  id,
  hint,
  error,
  className = "",
  ...rest
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-neutral-700"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-[#9BE749] focus:ring-2 focus:ring-[#9BE749]/40 ${
          error ? "border-red-400" : "border-neutral-300"
        } ${className}`}
        {...rest}
      />
      {(hint || error) && (
        <p className={`mt-1 text-xs ${error ? "text-red-600" : "text-neutral-500"}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}