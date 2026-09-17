"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import GoogleLoginBtn from "./GoogleLoginBtn";
import OTPVerification from "./OTPVerification";
import { Eye, EyeOff } from "lucide-react";

// Shared styling so both the Login and Register password inputs stay identical.
const PASSWORD_INPUT_CLASS =
  "w-full rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-12 text-sm shadow-inner shadow-neutral-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200";

function LegalLink({ href, children }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-purple-700 underline decoration-lime-400 decoration-2 underline-offset-4 transition hover:text-neutral-900"
    >
      {children}
    </Link>
  );
}

// Accessible password visibility toggle rendered inside the right edge of the input.
function PasswordVisibilityToggle({ isVisible, onToggle, controls }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isVisible ? "Hide password" : "Show password"}
      title={isVisible ? "Hide password" : "Show password"}
      aria-controls={controls}
      className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-xl text-neutral-500 transition hover:text-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/70"
    >
      {isVisible ? (
        <EyeOff className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Eye className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}

export default function AuthForm({ type }) {
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [otpResetKey, setOtpResetKey] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const { user, fetchMe } = useAuth();

  // If already logged in, redirect away
  useEffect(() => {
    if (user && type === "login") router.push("/");
  }, [user, type, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validateForm = () => {
    const nextErrors = {};

    if (type === "register" && !username.trim()) {
      nextErrors.username = "Enter your full name.";
    }

    if (!email.trim()) {
      nextErrors.email = "Enter your email address, for example name@example.com.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address, for example name@example.com.";
    }

    if (!password.trim()) {
      nextErrors.password = "Enter your password.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long.";
    }

    if (type === "register") {
      if (!confirmPassword) {
        nextErrors.confirmPassword = "Re-enter your password to confirm.";
      } else if (confirmPassword !== password) {
        nextErrors.confirmPassword = "Passwords do not match. Please re-enter them.";
      }

      if (!agreedToTerms) {
        nextErrors.terms =
          "Please agree to the Terms & Conditions and acknowledge the Privacy Policy to continue.";
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validateForm()) return;

    // Consent gate: registration must never proceed until the box is checked.
    if (type === "register" && !agreedToTerms) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Authentication failed");
        return;
      }

      if (type === "register" && data.step === "otp") {
        setStep("otp");
        setResendCooldown(60);
        return;
      }

      // Login: user needs to verify email first
      if (type === "login" && data.needsVerification) {
        setEmail(data.email || email);
        setStep("otp");
        setResendCooldown(60);
        setError("");
        return;
      }

      const shouldShowDisclaimer = !data?.user?.disclaimerAccepted;
      await fetchMe();
      router.push(shouldShowDisclaimer ? "/disclaimer" : "/");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // OTP entry UI lives in the shared OTPVerification component so the
  // registration flow and the service-purchase flow can never drift apart.

  const handleVerifyOtp = async (code) => {
    setError("");
    if (code.length !== 6) {
      setError("Enter the complete 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        setOtpResetKey((key) => key + 1);
        return;
      }
      const shouldShowDisclaimer = !data?.user?.disclaimerAccepted;
      await fetchMe();
      router.push(shouldShowDisclaimer ? "/disclaimer" : "/");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend code");
        if (data.cooldown) setResendCooldown(data.cooldown);
        return;
      }
      setResendCooldown(data.cooldown || 60);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep("form");
    setError("");
  };

  // --- OTP step UI (shared with the service-purchase flow) ---
  if (step === "otp") {
    return (
      <div className="relative min-h-screen bg-linear-to-br from-neutral-50 via-white to-lime-50/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#9BE74933,transparent_30%),radial-gradient(circle_at_80%_0%,#c7ffc033,transparent_28%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 pb-16 pt-28 md:px-8">
          <h1 className="sr-only">Verify your email</h1>
          <OTPVerification
            email={email}
            error={error}
            loading={loading}
            resendCooldown={resendCooldown}
            onSubmit={handleVerifyOtp}
            onResend={handleResendOtp}
            onBack={handleBackToForm}
            submitLabel="Verify email"
            loadingLabel="Verifying..."
            resetKey={otpResetKey}
          />
        </div>
      </div>
    );
  }

  // --- Form step UI ---
  return (
    <div className="relative min-h-screen bg-linear-to-br from-neutral-50 via-white to-lime-50/60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#9BE74933,transparent_30%),radial-gradient(circle_at_80%_0%,#c7ffc033,transparent_28%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 pb-16 pt-28 md:px-8">
        <h1 className="sr-only">
          {type === "login" ? "Login to trademilaan" : "Create your trademilaan account"}
        </h1>
        <div className="grid items-center gap-8 rounded-3xl border border-neutral-200/70 bg-white/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.08)] backdrop-blur lg:grid-cols-2 lg:p-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
                  {type === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="text-sm text-neutral-600 md:text-base">
                  Access AI-powered market insights and personalized strategies.
                  Sign in securely to continue to your dashboard.
                </p>
              </div>
            </div>

            {error && (
              <p role="alert" aria-live="assertive" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {type === "register" && (
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-neutral-800">
                    Name
                  </span>
                  <input
                    id="register-name"
                    name="username"
                    type="text"
                    placeholder="Your full name"
                    required
                    autoComplete="name"
                    aria-invalid={fieldErrors.username ? "true" : undefined}
                    aria-describedby={fieldErrors.username ? "register-name-error" : undefined}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-inner shadow-neutral-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {fieldErrors.username && (
                    <p id="register-name-error" role="alert" className="text-sm text-red-600">
                      {fieldErrors.username}
                    </p>
                  )}
                </label>
              )}

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-neutral-800">
                  Email
                </span>
                <input
                  id={type === "login" ? "login-email" : "register-email"}
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  aria-invalid={fieldErrors.email ? "true" : undefined}
                  aria-describedby={fieldErrors.email ? `${type}-email-error` : undefined}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-inner shadow-neutral-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {fieldErrors.email && (
                  <p id={`${type}-email-error`} role="alert" className="text-sm text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </label>

              <div className="block space-y-2">
                <label
                  htmlFor={type === "login" ? "login-password" : "register-password"}
                  className="text-sm font-semibold text-neutral-800"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id={type === "login" ? "login-password" : "register-password"}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter a strong password"
                    required
                    autoComplete={type === "login" ? "current-password" : "new-password"}
                    aria-invalid={fieldErrors.password ? "true" : undefined}
                    aria-describedby={fieldErrors.password ? `${type}-password-error` : undefined}
                    className={PASSWORD_INPUT_CLASS}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <PasswordVisibilityToggle
                    isVisible={showPassword}
                    onToggle={() => setShowPassword((visible) => !visible)}
                    controls={type === "login" ? "login-password" : "register-password"}
                  />
                </div>
                {fieldErrors.password && (
                  <p id={`${type}-password-error`} role="alert" className="text-sm text-red-600">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {type === "register" && (
                <div className="block space-y-2">
                  <label
                    htmlFor="register-confirm-password"
                    className="text-sm font-semibold text-neutral-800"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="register-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      required
                      autoComplete="new-password"
                      aria-invalid={fieldErrors.confirmPassword ? "true" : undefined}
                      aria-describedby={
                        fieldErrors.confirmPassword ? "register-confirm-password-error" : undefined
                      }
                      className={PASSWORD_INPUT_CLASS}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        }
                      }}
                    />
                    <PasswordVisibilityToggle
                      isVisible={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword((visible) => !visible)}
                      controls="register-confirm-password"
                    />
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p
                      id="register-confirm-password-error"
                      role="alert"
                      className="text-sm text-red-600"
                    >
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {type === "login" && (
                <p className="text-xs leading-relaxed text-neutral-500">
                  By continuing, you agree to our{" "}
                  <LegalLink href="/terms-and-condition">Terms &amp; Conditions</LegalLink> and
                  acknowledge our <LegalLink href="/privacy-policy">Privacy Policy</LegalLink>.
                </p>
              )}

              {type === "register" && (
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <input
                      id="register-terms"
                      name="termsAccepted"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (e.target.checked) {
                          setFieldErrors((prev) => ({ ...prev, terms: undefined }));
                        }
                      }}
                      aria-invalid={fieldErrors.terms ? "true" : undefined}
                      aria-describedby={fieldErrors.terms ? "register-terms-error" : undefined}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-neutral-300 accent-lime-500 text-lime-600 focus:ring-lime-500"
                    />
                    <label
                      htmlFor="register-terms"
                      className="cursor-pointer text-xs leading-relaxed text-neutral-600"
                    >
                      I agree to the <LegalLink href="/terms-and-condition">Terms &amp; Conditions</LegalLink>{" "}
                      and acknowledge that I have read the{" "}
                      <LegalLink href="/privacy-policy">Privacy Policy</LegalLink>.
                    </label>
                  </div>
                  {fieldErrors.terms && (
                    <p id="register-terms-error" role="alert" className="text-sm text-red-600">
                      {fieldErrors.terms}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-lime-400 px-4 py-3 text-sm font-semibold text-neutral-900 shadow-[0_12px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/10 transition hover:-translate-y-px hover:shadow-[0_14px_36px_rgba(0,0,0,0.18)] hover:ring-black/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/70 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? type === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : type === "login"
                    ? "Login securely"
                    : "Create account"}
              </button>
            </form>

            {error && (
              <p role="alert" className="text-center text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <span className="h-px flex-1 bg-neutral-200" />
                <span>or continue with</span>
                <span className="h-px flex-1 bg-neutral-200" />
              </div>
              <GoogleLoginBtn />
            </div>

            <div className="text-sm text-neutral-700">
              {type === "login" ? (
                <p>
                  Don’t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-purple-600 underline cursor-pointer decoration-2 underline-offset-4"
                  >
                    Register here
                  </Link>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-neutral-900 underline decoration-lime-400 decoration-2 underline-offset-4"
                  >
                    Login here
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="relative hidden h-full min-h-80 overflow-hidden rounded-2xl border border-neutral-200/70 bg-linear-to-br from-neutral-900 via-neutral-800 to-black shadow-[0_30px_80px_rgba(0,0,0,0.22)] lg:block">
            <div className="absolute inset-0 bg-linear-to-tr from-lime-400/40 via-lime-200/10 to-transparent" />
            <Image
              src="/trademilaan.png"
              alt="Trading analytics dashboard"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover opacity-90"
              priority
            />
            <div className="absolute left-6 bottom-6 flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-lg shadow-lime-200/60 backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-lime-500" />
              Secure, SEBI-compliant access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
