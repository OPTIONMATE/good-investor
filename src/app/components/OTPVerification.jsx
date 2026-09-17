"use client";

import { useEffect, useRef, useState } from "react";

/**
 * OTPVerification
 *
 * Shared OTP entry UI (6 boxes, verify action, resend + cooldown, optional back
 * action). This is the exact UI used by the registration flow
 * (components/AuthForm.jsx), extracted so every OTP step in the product —
 * registration, login verification and the service-purchase flow — renders the
 * same experience.
 *
 * UI only: the component never talks to an API. The owner (parent) supplies the
 * API calls through `onSubmit` / `onResend`, keeps the loading + error state and
 * decides what happens on success.
 *
 * Props
 *  - email           : address the code was sent to (shown in the subtitle)
 *  - title           : card heading (default "Verify your email")
 *  - description     : overrides the default subtitle text
 *  - error           : message rendered under the boxes
 *  - notice          : non-error status message (e.g. "A new code was sent")
 *  - loading         : disables the form and shows the loading label
 *  - resendCooldown  : seconds left before resend is allowed (0 = enabled)
 *  - onSubmit(code)  : called with the joined 6-digit code
 *  - onResend        : optional resend handler
 *  - onBack          : optional back handler — the link only renders when set
 *  - backLabel       : label for the back action
 *  - submitLabel     : primary button label
 *  - loadingLabel    : primary button label while `loading`
 *  - resetKey        : change this value (e.g. on a failed verification) to
 *                      clear the boxes and refocus the first one
 *  - framed          : renders the standalone card wrapper used by the
 *                      registration/login pages (default true). Set false when
 *                      the caller already provides the panel, e.g. the
 *                      service-purchase modal — the OTP UI itself stays identical.
 */
export const OTP_LENGTH = 6;

export default function OTPVerification({
  email = "",
  title = "Verify your email",
  description,
  error = "",
  notice = "",
  loading = false,
  resendCooldown = 0,
  onSubmit,
  onResend,
  onBack,
  backLabel = "← Back to registration",
  submitLabel = "Verify email",
  loadingLabel = "Verifying...",
  resetKey,
  framed = true,
}) {
  const [otp, setOtp] = useState(() => Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef([]);
  const isFirstRender = useRef(true);

  // Focus the first box as soon as the step is shown.
  useEffect(() => {
    const timer = setTimeout(() => inputRefs.current[0]?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Clear the entered digits whenever the owner signals a reset (failed
  // verification, "back", etc.) so the user starts from a clean slate.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  }, [resetKey]);

  const code = otp.join("");

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const nextOtp = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < OTP_LENGTH; i++) {
      nextOtp[i] = pasted[i] || "";
    }
    setOtp(nextOtp);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length !== OTP_LENGTH) return;
    onSubmit?.(code);
  };

  return (
    <div
      className={
        framed
          ? "mx-auto w-full max-w-md rounded-3xl border border-neutral-200/70 bg-white/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.08)] backdrop-blur md:p-8"
          : "w-full"
      }
    >
      <div className={framed ? "space-y-6" : "space-y-5"}>
        <div className="space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-lime-100">
            <svg
              className="h-6 w-6 text-lime-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">
            {title}
          </h2>
          <p className="text-sm text-neutral-600">
            {description ?? (
              <>
                We sent a 6-digit verification code to{" "}
                <span className="font-medium text-neutral-900">{email}</span>
              </>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="flex justify-center gap-1.5 sm:gap-2"
            onPaste={handlePaste}
            role="group"
            aria-label="One-time password"
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                aria-label={`Digit ${index + 1}`}
                aria-invalid={error ? "true" : undefined}
                className="h-12 min-w-0 max-w-[2.75rem] flex-1 rounded-xl border border-neutral-200 bg-white text-center text-lg font-semibold shadow-inner shadow-neutral-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200 sm:max-w-[3.25rem] md:h-14"
              />
            ))}
          </div>

          {error && (
            <p
              role="alert"
              aria-live="assertive"
              className="text-center text-sm text-red-600"
            >
              {error}
            </p>
          )}

          {notice && !error && (
            <p
              role="status"
              aria-live="polite"
              className="text-center text-sm text-lime-700"
            >
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== OTP_LENGTH}
            className="w-full cursor-pointer rounded-full bg-lime-400 px-4 py-3 text-sm font-semibold text-neutral-900 shadow-[0_12px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/10 transition hover:-translate-y-px hover:shadow-[0_14px_36px_rgba(0,0,0,0.18)] hover:ring-black/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? loadingLabel : submitLabel}
          </button>
        </form>

        <div className="space-y-3 text-center">
          {onResend && (
            <p className="text-sm text-neutral-600">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={onResend}
                disabled={resendCooldown > 0 || loading}
                className="cursor-pointer font-semibold text-lime-600 underline decoration-2 underline-offset-4 transition hover:text-lime-700 disabled:cursor-not-allowed disabled:text-neutral-400 disabled:no-underline"
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend code"}
              </button>
            </p>
          )}

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="cursor-pointer text-sm font-medium text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-700"
            >
              {backLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
