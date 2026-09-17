"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const SCROLL_THRESHOLD = 700;

export default function ScrollAuthGate({ children }) {
  const { user } = useAuth();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (user) {
      setBlocked(false);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > SCROLL_THRESHOLD) setBlocked(true);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [user]);

  useEffect(() => {
    if (blocked) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [blocked]);

  return (
    <div className="relative">
      {children}

      {!user && blocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-6 space-y-4 text-center">
            <p className="text-lg font-semibold text-neutral-900">Continue to see the rest</p>
            <p className="text-sm text-neutral-600">
              Please log in or create an account to keep exploring. It only takes a few seconds.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-neutral-800 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center rounded-full border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition"
              >
                Create account
              </Link>
            </div>
            <p className="text-xs text-neutral-500">
              Once you sign in, you can view the full experience without interruptions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}