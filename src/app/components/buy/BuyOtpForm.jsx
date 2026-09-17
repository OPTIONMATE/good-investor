"use client";

import { useEffect, useState } from "react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";
import OTPVerification from "@/app/components/OTPVerification";
import {
  buyInfoClass,
  OTP_RESEND_COOLDOWN,
} from "./BuyFlowShell";

/**
 * Step 3 of the purchase flow — email OTP verification.
 *
 * The UI is the shared `OTPVerification` component (the exact component the
 * registration flow renders), so both OTP experiences are identical. Only the
 * business logic lives here: verify via /api/buy/verify-otp and re-issue the
 * code through the endpoint that created it (POST /api/buy/start).
 *
 * `details` is the details payload the user confirmed in the previous step; it is
 * re-posted on resend so the emailed code is issued for the same record.
 */
export default function BuyOtpForm({ onSuccess, onBack, email = "", details }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resendCooldown, setResendCooldown] = useState(OTP_RESEND_COOLDOWN);
  const [resetKey, setResetKey] = useState(0);

  // Resend cooldown timer (same 60s cadence as registration).
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const verifyOtp = async (code) => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await fetchWithCsrf("/api/buy/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp: code }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Invalid or expired OTP");
        setResetKey((key) => key + 1);
        return;
      }

      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      // Re-issuing the code reuses the existing purchase endpoint, which issues
      // the BUY_VERIFICATION OTP (latest wins) and emails it again.
      const res = await fetchWithCsrf("/api/buy/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(details || {}),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Could not resend the code. Please try again.");
        return;
      }

      setResendCooldown(OTP_RESEND_COOLDOWN);
      setResetKey((key) => key + 1);
      setNotice(
        email
          ? `A new 6-digit code was sent to ${email}.`
          : "A new 6-digit code was sent to your email.",
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <OTPVerification
        framed={false}
        email={email}
        error={error}
        notice={notice}
        loading={loading}
        resendCooldown={resendCooldown}
        onSubmit={verifyOtp}
        onResend={resendOtp}
        onBack={onBack}
        backLabel="← Back to your details"
        submitLabel="Verify & continue"
        loadingLabel="Verifying..."
        resetKey={resetKey}
      />

      <p className={buyInfoClass}>
        Your details are saved and your PAN is verified with this code. The code
        is valid for 5 minutes and can only be used once.
      </p>
    </div>
  );
}
