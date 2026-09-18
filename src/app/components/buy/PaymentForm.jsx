import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { profileValueFromUserRecord } from "@/app/lib/profileFields";
import {
  buyErrorClass,
  buyInputClass,
  buyLabelClass,
  buyPrimaryButtonClass,
  buySecondaryButtonClass,
} from "./BuyFlowShell";

// Spinner styled like the rest of the flow (Services-page lime accent).
function Spinner() {
  return (
    <div
      className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-[#9BE749]"
      aria-hidden="true"
    />
  );
}

export default function PaymentForm({
  onPaymentComplete,
  onBack,
  planData,
  userDetails,
  agreementId,
}) {
  const { user } = useAuth();
  const router = useRouter();
  // Billing details: only user-typed values live in state; the account record
  // and the KYC name from the details step supply the initial values.
  const [billingEdits, setBillingEdits] = useState({});
  const [loading, setLoading] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [success, setSuccess] = useState(false);
  const [verifyData, setVerifyData] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const selectedPlanName = planData?.planName || "Selected Plan";
  const selectedAmount =
    Number(String(planData?.price ?? "").replace(/[^\d.]/g, "")) || 0;

  const kycFullName = userDetails?.fullName?.trim() || "";
  // Phone priority: freshest KYC value from the details step first, then the
  // saved account record (AuthContext already carries the serialized user, so
  // no extra request and no new backend endpoint).
  const kycPhone = profileValueFromUserRecord("phone", userDetails?.phone);
  const accountPhone = profileValueFromUserRecord("phone", user?.phone);

  const accountName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    (user?.email ? String(user.email).split("@")[0] : "");

  // Prefilled from the account / KYC step, editable at any time: a typed value
  // always wins over the prefilled one.
  const form = {
    name: billingEdits.name ?? (kycFullName || accountName),
    email: billingEdits.email ?? (user?.email || ""),
    phone: billingEdits.phone ?? (kycPhone || accountPhone),
  };

  // ✅ Load Razorpay SDK
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setBillingEdits((prev) => ({ ...prev, [name]: nextValue }));
  };

  const formatDateLabel = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getActiveSubscriptionMessage = (payload, fallbackPlanName) => {
    const until = formatDateLabel(payload?.activeUntil);
    const safePlanName = payload?.planName || fallbackPlanName || "this plan";
    return `You already have an active subscription for ${safePlanName} till ${until}. Please renew after expiry.`;
  };

  // ✅ Coupon Verification Handler
  const handleVerifyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setAppliedCoupon(null);

    try {
      const response = await fetch("/api/coupons");
      const result = await response.json();

      if (result.success) {
        const coupon = result.data.find(
          (c) => c.code === couponCode.toUpperCase() && c.isActive,
        );

        if (!coupon) {
          setCouponError("Invalid or inactive coupon code");
          return;
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          setCouponError("This coupon has expired");
          return;
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          setCouponError("This coupon has reached its usage limit");
          return;
        }

        setAppliedCoupon(coupon);
        setCouponError("");
      } else {
        setCouponError("Could not verify coupon. Please try again.");
      }
    } catch (err) {
      console.error("Coupon verification error:", err);
      setCouponError("Error verifying coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  // ✅ Calculate Discount
  let discountAmount = 0;
  let finalAmount = selectedAmount;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = (selectedAmount * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    finalAmount = Math.max(0, selectedAmount - discountAmount);
  }

  // ✅ Payment Handler
  const handlePayment = async (e) => {
    e.preventDefault();

    if (!planData?.planId || !selectedAmount) {
      setError("Selected plan is invalid. Please choose a plan again.");
      return;
    }

    if (!window.Razorpay) {
      setError(
        "Payment gateway is still loading. Please try again in a moment.",
      );
      return;
    }

    setLoading(true);
    setIsVerifyingPayment(false);
    setError("");
    setErrorCode("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/payment/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planData.planId,
          email: form.email,
          ...(appliedCoupon && { couponCode: appliedCoupon.code }),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.order) {
        if (res.status === 409 && data?.code === "ACTIVE_SUBSCRIPTION_EXISTS") {
          setErrorCode("ACTIVE_SUBSCRIPTION_EXISTS");
          setError(getActiveSubscriptionMessage(data, selectedPlanName));
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Order creation failed");
      }

      const serverPricing = data.pricing || {
        finalAmount,
        planName: selectedPlanName,
        planType: planData?.type || "",
      };

      const options = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: selectedPlanName,
        description: `Subscription - ${selectedPlanName}`,
        order_id: data.order.id,
        prefill: {
          name: kycFullName || form.name,
          email: form.email,
          contact: form.phone,
        },

        handler: async function (response) {
          try {
            setIsVerifyingPayment(true);
            const billingName = kycFullName || form.name;
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                ...form,
                name: billingName,
                amount: serverPricing.finalAmount,
                planId: planData.planId,
                planName: serverPricing.planName || selectedPlanName,
                planType: serverPricing.planType || planData?.type || "",
                state: userDetails?.state,
                panNumber: userDetails?.panNumber,
                // Exact agreement this payment belongs to; validated + linked
                // server-side in POST /api/payment/verify (never trusted blindly).
                ...(agreementId ? { agreementId } : {}),
                ...(appliedCoupon && { couponCode: appliedCoupon.code }),
              }),
            });

            const vData = await verifyRes.json();

            if (vData.success) {
              setSuccess(true);
              setErrorCode("");
              setVerifyData({ ...response, ...vData });
              setIsVerifyingPayment(false);

              if (onPaymentComplete) {
                onPaymentComplete({
                  ...vData,
                  expiry: vData?.expiresAt || null,
                });
              }
            } else {
              if (
                verifyRes.status === 409 &&
                vData?.code === "ACTIVE_SUBSCRIPTION_EXISTS"
              ) {
                setErrorCode("ACTIVE_SUBSCRIPTION_EXISTS");
                setError(getActiveSubscriptionMessage(vData, selectedPlanName));
              } else {
                setErrorCode("");
                setError(vData.error || "Verification failed");
              }
              setIsVerifyingPayment(false);
            }
          } catch (err) {
            setErrorCode("");
            setError(err?.message || "Payment verification failed");
            setIsVerifyingPayment(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        setErrorCode("");
        setError(response?.error?.description || "Payment failed");
        setIsVerifyingPayment(false);
      });

      rzp.open();
    } catch (err) {
      setErrorCode("");
      setError(err?.message || "Payment initialization failed");
      setIsVerifyingPayment(false);
    }

    setLoading(false);
  };

  if (isVerifyingPayment) {
    return (
      <div className="space-y-4 py-10 text-center">
        <Spinner />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-neutral-900">
            Payment received
          </h3>
          <p className="text-sm text-neutral-600">
            Verifying your payment and preparing your invoice...
          </p>
          <p className="text-xs text-neutral-500">
            Please do not close this window.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Success / Failure Screen
  if (success || error) {
    // Show loader while invoice is being generated
    if (success && !verifyData) {
      return (
        <div className="space-y-4 py-10 text-center">
          <Spinner />
            
            <div className="space-y-1">
            <h3 className="text-lg font-bold text-neutral-900">
              Processing your payment
            </h3>
            <p className="text-sm text-neutral-600">
              Generating and sending your invoice...
            </p>
            <p className="text-xs text-neutral-500">
              This may take a few seconds.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5 py-6 text-center">
        {success ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#9BE749]/20">
              <Check className="h-6 w-6 text-[#4c7a13]" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">
              Payment successful
            </h3>
            <p className="text-sm text-neutral-600">
              Thank you for your payment.
            </p>

            <button
              type="button"
              disabled={!verifyData}
              className={buyPrimaryButtonClass}
              onClick={async () => {
                const invoiceName = kycFullName || form.name;
                const params = new URLSearchParams({
                  payment_id: verifyData.razorpay_payment_id,
                  name: invoiceName,
                  email: form.email,
                  phone: form.phone,
                  amount: String(verifyData?.amount || Math.round(finalAmount)),
                  service: selectedPlanName,
                  planName: selectedPlanName,
                  state: userDetails?.state ?? "",
                  pan: userDetails?.panNumber ?? "",
                  qty: "1",
                });

                const res = await fetch(
                  `/api/payment/invoice?${params.toString()}`,
                );

                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.download = `invoice-${verifyData.razorpay_payment_id}.pdf`;
                link.click();
              }}
            >
              Download Invoice
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <X className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Payment failed</h3>
            <p className="text-sm text-neutral-600">{error}</p>
            {errorCode === "ACTIVE_SUBSCRIPTION_EXISTS" && (
              <button
                type="button"
                onClick={() => router.push("/my-subscriptions")}
                className={buyPrimaryButtonClass}
              >
                Go to my subscriptions
              </button>
            )}
          </>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onBack}
            className={buySecondaryButtonClass}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // ✅ Main Form
  return (
    <form onSubmit={handlePayment} className="space-y-6">
      <p className="text-sm text-neutral-600">
        Payments are processed securely by Razorpay. Your invoice is emailed to
        you after a successful payment.
      </p>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="flex items-center justify-between text-sm text-neutral-700">
          <span className="font-medium">Plan</span>
          <span className="font-semibold text-neutral-900">
            {selectedPlanName}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-neutral-700">
          <span className="font-medium">Amount</span>
          <span className="font-semibold text-neutral-900">
            Rs. {selectedAmount}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="mt-2 flex items-center justify-between text-sm text-[#3f6d13]">
            <span className="font-medium">Coupon discount</span>
            <span className="font-semibold">
              - Rs. {Math.round(discountAmount)}
            </span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 text-base text-neutral-900">
          <span className="font-semibold">Payable</span>
          <span className="font-bold">Rs. {Math.round(finalAmount)}</span>
        </div>
      </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="payment-name"
            className={`mb-2 block ${buyLabelClass}`}
          >
            Name
          </label>
          <input
            id="payment-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Name on the invoice"
            className={buyInputClass}
          />
        </div>

        <div>
          <label
            htmlFor="payment-email"
            className={`mb-2 block ${buyLabelClass}`}
          >
            Email
          </label>
          <input
            id="payment-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className={buyInputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="payment-phone"
            className={`mb-2 block ${buyLabelClass}`}
          >
            Phone
          </label>
          <input
            id="payment-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="10-digit mobile number"
            className={buyInputClass}
          />
        </div>
      </div>

        {/* Coupon */}
      <div>
        <label
          htmlFor="coupon-code"
          className={`mb-3 block ${buyLabelClass}`}
        >
          Have a coupon code? (optional)
        </label>
        {appliedCoupon ? (
          <div className="flex items-center justify-between rounded-xl border border-[#9BE749]/40 bg-[#9BE749]/10 p-4">
            <div>
              <p className="text-sm font-semibold text-[#3f6d13]">
                Coupon applied
              </p>
              <p className="mt-1 text-sm text-neutral-700">
                Code:{" "}
                <span className="font-mono font-bold">{appliedCoupon.code}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAppliedCoupon(null);
                setCouponCode("");
                setCouponError("");
              }}
              className="cursor-pointer text-sm font-semibold text-neutral-700 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="coupon-code"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className={`${buyInputClass} font-mono uppercase sm:flex-1`}
              disabled={couponLoading}
            />
            <button
              type="button"
              onClick={handleVerifyCoupon}
              disabled={couponLoading || !couponCode.trim()}
              className={buySecondaryButtonClass}
            >
              {couponLoading ? "Checking..." : "Apply"}
            </button>
          </div>
        )}
        {couponError && (
          <p role="alert" className="mt-2 text-sm font-medium text-red-600">
            {couponError}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" aria-live="assertive" className={buyErrorClass}>
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onBack}
          className={buySecondaryButtonClass}
        >
          Back
        </button>

        <button
          type="submit"
          disabled={loading || !planData?.planId || !selectedAmount}
          className={buyPrimaryButtonClass}
        >
          {loading ? "Processing..." : "Continue with payment"}
        </button>
      </div>
    </form>
  );
}
