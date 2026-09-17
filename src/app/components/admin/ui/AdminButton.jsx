"use client";

import { cn } from "@/app/lib/utils";

const variants = {
  primary:
    "bg-[#9BE749] text-black hover:bg-[#8FD641] active:bg-[#83CB38] shadow-sm",
  secondary:
    "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100",
  ghost: "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
  outline: "border border-[#9BE749] bg-transparent text-lime-800 hover:bg-lime-50",
};

const sizes = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2 text-sm",
  lg: "px-4 py-2.5 text-base",
};

export default function AdminButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}