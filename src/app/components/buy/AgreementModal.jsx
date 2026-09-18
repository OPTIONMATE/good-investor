"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import ESignModal from "@/app/components/ESignModal";
import PaymentForm from "@/app/components/buy/PaymentForm";
import ServiceAgreement from "@/components/ServiceAgreement";
import { fetchWithCsrf } from "@/app/lib/csrfClient";
import BuyFlowShell, {
  BuyActions,
  buyPrimaryButtonClass,
  buySecondaryButtonClass,
  buySuccessClass,
} from "./BuyFlowShell";

// Download action uses the product's purple accent (registration/login links,
// E-Sign tabs, agreement keyword highlight) so it reads as a primary action
// next to the lime "Continue to payment" CTA.
const buyDownloadButtonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-700 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/70 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto";

export default function AgreementModal({
  onClose,
  onSuccess,
  planData,
  userDetails,
  agreementId: agreementIdProp,
}) {
  const { user } = useAuth();
  const [checked, setChecked] = useState(false);
  const [showSign, setShowSign] = useState(false);
  const [signedFileId, setSignedFileId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [signingData, setSigningData] = useState(null);
  const [capturedAgreementHtml, setCapturedAgreementHtml] = useState("");
   // The exact SignedAgreement._id produced by sign-and-store; carried into the
  // payment step so POST /api/payment/verify can link Payment → Agreement.
  const [linkedAgreementId, setLinkedAgreementId] = useState(
    agreementIdProp || null,
  );

  // KYC from BuyDetailsForm (Buy flow) — prefer over profile-only user fields
  const kycClientName =
    userDetails?.fullName?.trim() ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    "Client Name";
  const kycPan = userDetails?.panNumber || user?.panNumber || user?.pan || "";
  const kycEmail = userDetails?.email?.trim() || user?.email || "";
  const kycDob = userDetails?.dob || "";
  const kycState = userDetails?.state || "";
  const kycGender = userDetails?.gender || "";

  // Capture agreement HTML when user submits for signing
  const captureAgreementHtml = () => {
    try {
      const agreementElement = document.querySelector(".agreement-text");
      if (agreementElement) {
        const clonedElement = agreementElement.cloneNode(true);
        const html = clonedElement.innerHTML || "";
        console.log("📄 Captured agreement HTML length:", html.length);
        console.log("📄 First 200 chars:", html.substring(0, 200));
        return html;
      } else {
        console.warn("⚠️ Agreement element not found in DOM");
        return "";
      }
    } catch (err) {
      console.error("Error capturing agreement HTML:", err);
      return "";
    }
  };

  // Submitting agreement acceptance
  const handleSubmit = async () => {
    try {
      // Capture the agreement HTML while it's still in the DOM
      const htmlContent = captureAgreementHtml();
      if (!htmlContent) {
        console.warn("⚠️ Warning: Agreement HTML was not captured");
      }
      setCapturedAgreementHtml(htmlContent);

      // Accept agreement
      const res = await fetchWithCsrf("/api/agreement/accept", { method: "POST" });
      if (!res.ok) throw new Error("Failed to accept agreement");
      setShowSign(true);
    } catch (err) {
      console.error("ACCEPT ERROR:", err);
    }
  };

  // Called from ESignModal AFTER stamping
  const handleSigned = async (signedData) => {
    try {
      // Check if user is logged in
      if (!user) {
        throw new Error("User not authenticated. Please log in first.");
      }

      // Use the pre-captured agreement HTML from state
      const agreementHtml = capturedAgreementHtml || "";

      if (!agreementHtml) {
        console.warn("⚠️ Warning: Agreement HTML is empty");
      }

      console.log(
        "📝 Using captured agreement HTML, length:",
        agreementHtml.length,
      );
      console.log("🔍 Signed data:", {
        signedName: signedData.signedName,
        signedTimestamp: signedData.signedTimestamp,
        hasSignatureData: !!signedData.signatureUrl,
      });

      // Debug: Log user object to verify email presence
      console.log("[DEBUG] User object before signing:", user);

      // Prepare secure signing data for backend
      // Use available user fields with fallbacks
      const clientName =
        userDetails?.fullName?.trim() ||
        user?.fullName ||
        user?.name ||
        user?.username ||
        user?.email?.split("@")[0] ||
        "Unknown";
      const clientPan =
        userDetails?.panNumber ||
        user?.panNumber ||
        user?.pan ||
        "NOT_PROVIDED";
      const clientPhone =
        userDetails?.phone ||
        user?.phone ||
        "";
      const clientDob =
        userDetails?.dob ||
        user?.dob ||
        "";
      const clientState =
        userDetails?.state ||
        user?.state ||
        "";

      const signingPayload = {
        agreementHtml, // Now using pre-captured HTML
        userId: user?._id || user?.id,
        clientName,
        clientPan,
        clientPhone,
        clientDob,
        clientState,
        signedPlanName: planData?.planName || planData?.name || "",
        signedPlanId: String(planData?._id || planData?.id || ""),
        signedPlanType: String(planData?.type || ""),
        signedPlanDuration: Number(planData?.duration || 0) || undefined,
        signatureData: signedData.signatureUrl,
        signedName: signedData.signedName,
        signedTimestamp: signedData.signedTimestamp,
        signatureTab: signedData.signatureTab,
        ipAddress: null, // Will be captured by backend
        clientEmail: user?.email || user?.primaryEmail || "",
      };

      console.log(
        "📤 Sending signing payload with HTML length:",
        agreementHtml.length,
      );

      setSigningData(signedData);

      // Send to backend for secure PDF generation and storage
      const res = await fetchWithCsrf("/api/agreement/sign-and-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signingPayload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to sign and store agreement");
      }

      console.log(
        "✅ Agreement successfully signed and stored. File ID:",
        result.fileId,
      );

      // Store the returned file ID for downloading
      setSignedFileId(result.fileId);
      setLinkedAgreementId(result.agreementId || result.fileId || null);
      setShowSign(false);
    } catch (err) {
      console.error("❌ SIGNING ERROR:", err);
      alert("Error signing agreement: " + err.message);
    }
  };

  // Called when payment is completed
  const [paymentResult, setPaymentResult] = useState(null);
  const handlePaymentComplete = (paymentData) => {
    setShowPayment(false);
    if (typeof paymentData === "string") {
      setPaymentResult({ success: false, error: paymentData });
    } else {
      setPaymentResult(paymentData);
    }
  };

  // Payment is its own step of the purchase flow (the agreement is signed by now).
  if (showPayment) {
    return (
      <BuyFlowShell
        title="Payment"
        subtitle="Complete your payment to activate your subscription."
        step={5}
        planData={planData}
        onClose={onClose}
        maxWidth="max-w-4xl"
      >
        <PaymentForm
          onPaymentComplete={handlePaymentComplete}
          onBack={() => setShowPayment(false)}
          planData={planData}
          userDetails={userDetails}
          agreementId={linkedAgreementId}
        />
      </BuyFlowShell>
    );
  }

  return (
    <>
      <BuyFlowShell
        title="Service Agreement"
        subtitle="Review the agreement, E-Sign it and continue to payment."
        step={4}
        planData={planData}
        onClose={onClose}
        maxWidth="max-w-4xl"
      >
        {paymentResult ? (
          <div className="space-y-5 text-center">
                {paymentResult.success ? (
                  <>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#9BE749]/20">
                      <Check className="h-6 w-6 text-[#4c7a13]" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900">
                      Payment successful
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Thank you for your payment. Your subscription is now active.
                    </p>
                    {paymentResult.razorpay_payment_id ? (
                      <button
                        type="button"
                        className={buyPrimaryButtonClass}
                        onClick={async () => {
                          const planLabel =
                            paymentResult.planName ||
                            planData?.planName ||
                            "";
                          const invoiceName =
                            userDetails?.fullName?.trim() ||
                            paymentResult.name;
                          const params = new URLSearchParams({
                            payment_id: paymentResult.razorpay_payment_id,
                            name: invoiceName,
                            email: paymentResult.email,
                            phone: paymentResult.phone,
                            amount: paymentResult.amount?.toString() || "4399",
                            service: planLabel,
                            planName: planLabel,
                            state: userDetails?.state ?? "",
                            pan: userDetails?.panNumber ?? "",
                            qty: "1",
                          });
                          const response = await fetch(
                            `/api/payment/invoice?${params.toString()}`,
                          );
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `invoice-${paymentResult.razorpay_payment_id}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        }}
                      >
                        Download Invoice
                      </button>

                    ) : (
                      <>
                        <button
                          type="button"
                          className={buyPrimaryButtonClass}
                          onClick={async () => {
                            const params = new URLSearchParams({
                              payment_id: paymentResult.razorpay_payment_id,
                              name: paymentResult.name,
                              email: paymentResult.email,
                              phone: paymentResult.phone,
                              amount: paymentResult.amount?.toString() || "4399",
                            });
                            const response = await fetch(
                              `/api/payment/invoice?${params.toString()}`,
                            );
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = `invoice-${paymentResult.razorpay_payment_id}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          }}
                        >
                          Download Invoice
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <X className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900">
                      Payment failed
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {paymentResult.error ||
                        "Payment was not successful. Please try again."}
                    </p>
                  </>
                )}

                {paymentResult.success ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className={buySecondaryButtonClass}
                  >
                    Done
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      // Retry from a clean payment state (the previous Back
                      // button was a dead end when the payment failed).
                      setPaymentResult(null);
                      setShowPayment(true);
                    }}
                    className={buyPrimaryButtonClass}
                  >
                    Try payment again
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* ======================= SIGNED AGREEMENT REVIEW THEN PAYMENT THEN DOWNLOAD ======================= */}
                {showSign ? null : signedFileId ? (
                  <>
                    <p className={buySuccessClass}>
                      ✓ Agreement signed successfully. Your signature appears in
                      the document below.
                    </p>
                    <ServiceAgreement
                      clientName={kycClientName}
                      clientPan={kycPan}
                      clientEmail={kycEmail}
                      clientDob={kycDob}
                      clientState={kycState}
                      clientGender={kycGender}
                      planName={planData?.planName || planData?.name || ""}
                      planType={planData?.type || "monthly"}
                      planDuration={planData?.duration}
                      planStartDate={
                        signingData?.signedTimestamp
                          ? new Date(signingData.signedTimestamp)
                          : new Date()
                      }
                      signedDate={
                        signingData?.signedTimestamp
                          ? new Date(
                              signingData.signedTimestamp,
                            ).toLocaleDateString("en-IN")
                          : new Date().toLocaleDateString("en-IN")
                      }
                    />
                    <div className="mt-6 flex flex-col gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
                      <a
                        href={`/api/agreement/download/${signedFileId}`}
                        download={`agreement-${signedFileId}.pdf`}
                        className={buyDownloadButtonClass}
                      >
                        Download signed agreement (PDF)
                      </a>

                      <button
                        type="button"
                        onClick={() => setShowPayment(true)}
                        className={buyPrimaryButtonClass}
                      >
                        Continue to payment
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* ======================= NORMAL AGREEMENT VIEW ======================= */}
                    <ServiceAgreement
                      clientName={kycClientName}
                      clientPan={kycPan}
                      clientEmail={kycEmail}
                      clientDob={kycDob}
                      clientState={kycState}
                      clientGender={kycGender}
                      planName={planData?.planName || planData?.name || ""}
                      planType={planData?.type || "monthly"}
                      planDuration={planData?.duration}
                      planStartDate={new Date()}
                      signedDate={new Date().toLocaleDateString("en-IN")}
                    />
                    <label className="mt-4 flex items-start gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-[#9BE749]"
                      />
                      <span>
                        I have read the <span className="font-semibold text-purple-500">agreement</span> and will <span className="font-semibold text-purple-500">proceed to E-Sign.</span>.
                      </span>
                    </label>

                    <BuyActions>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!checked}
                        className={buyPrimaryButtonClass}
                      >
                        Accept &amp; E-Sign
                      </button>
                    </BuyActions>
                  </>
                )}
              </>
            )}
      </BuyFlowShell>

      {/* ======================= SIGN MODAL ======================= */}
      {showSign && (
        <ESignModal
          pdfUrl={pdfUrl}
          onClose={() => setShowSign(false)}
          onSaved={handleSigned}
        />
      )}
    </>
  );
}
