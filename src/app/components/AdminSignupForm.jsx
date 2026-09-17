"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function AdminSignupForm() {
  const [step, setStep] = useState("email"); // "email", "otp", "password"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Failed to send OTP");
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setStep("otp");
    } catch (err) {
      setError("Error sending OTP: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 & 3: Create Admin Account with OTP Verification
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.message || data.error || "Failed to create admin account",
        );
        setLoading(false);
        return;
      }

      // Redirect to admin dashboard on success
      router.push("/admin-dashboard");
    } catch (err) {
      setError("Error creating account: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-neutral-50 via-white to-lime-50/60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#9BE74933,transparent_30%),radial-gradient(circle_at_80%_0%,#c7ffc033,transparent_28%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 pb-16 pt-28 md:px-8">
        <div className="grid items-center gap-8 rounded-3xl border border-neutral-200/70 bg-white/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.08)] backdrop-blur lg:grid-cols-2 lg:p-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
                  Admin Registration
                </h2>
                <p className="text-sm text-neutral-600 md:text-base">
                  Create a secure admin account with OTP verification to manage
                  the trademilaan platform.
                </p>
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            {/* STEP 1: Email & Request OTP */}
            {step === "email" && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-neutral-800">
                    Admin Email
                  </span>

                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-inner shadow-neutral-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-lime-400 px-4 py-3 text-sm font-semibold text-neutral-900 shadow-[0_12px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/10 transition hover:translate-y-[-1px] hover:shadow-[0_14px_36px_rgba(0,0,0,0.18)] hover:ring-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            )}

            {/* STEP 2 & 3: OTP + Password */}
            {step === "otp" && (
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                {/* OTP Input */}
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-neutral-800">
                    Enter OTP
                  </span>
                  <p className="text-xs text-neutral-600">
                    Check your email for the 6-digit OTP (expires in 5 minutes)
                  </p>
                  <input
                    id="admin-otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    required
                    maxLength="6"
                    autoComplete="one-time-code"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-inner shadow-neutral-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200 tracking-widest text-center"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </label>

                {/* Password */}
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-neutral-800">
                    Password
                  </span>
                  <input
                    id="admin-password"
                    name="password"
                    type="password"
                    placeholder="Enter a strong password"
                    required
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-inner shadow-neutral-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>

                {/* Confirm Password */}
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-neutral-800">
                    Confirm Password
                  </span>
                  <input
                    id="admin-confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    required
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-inner shadow-neutral-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </label>

                {/* Create Admin Button - Only enabled with all fields + OTP */}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !otp ||
                    !password ||
                    !confirmPassword ||
                    otp.length !== 6
                  }
                  className="w-full rounded-full bg-lime-400 px-4 py-3 text-sm font-semibold text-neutral-900 shadow-[0_12px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/10 transition hover:translate-y-[-1px] hover:shadow-[0_14px_36px_rgba(0,0,0,0.18)] hover:ring-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Account..." : "Create Admin Account"}
                </button>

                {/* Resend OTP */}
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="w-full rounded-full bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </form>
            )}

            {/* Login Link */}
            <div className="text-sm text-neutral-700">
              <p>
                Already have an admin account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-purple-600 underline cursor-pointer decoration-2 underline-offset-4"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>

          <div className="relative hidden h-full min-h-[320px] overflow-hidden rounded-2xl border border-neutral-200/70 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black shadow-[0_30px_80px_rgba(0,0,0,0.22)] lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-lime-400/40 via-lime-200/10 to-transparent" />
            <Image
              src="/trademilaan.png"
              alt="Admin dashboard"
              fill
              className="object-cover opacity-90"
              priority
            />
            <div className="absolute left-6 bottom-6 flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-lg shadow-lime-200/60 backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-lime-500" />
              Secure admin access with OTP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
