"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consent: false,
    website: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const normalizedValue =
      name === "phone"
        ? value.replace(/\D/g, "").slice(0, 10)
        : type === "checkbox"
          ? checked
          : value;

    setFormData((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }));

    if (touched[name] || submitAttempted) {
      const fieldError = validateField(name, normalizedValue);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  };

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "name":
        if (!value.trim() || value.trim().length < 2) {
          return "Please enter your full name (minimum 2 characters).";
        }
        return "";
      case "email":
        if (!value.trim()) {
          return "Please enter a valid email address, e.g. name@example.com.";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address, e.g. name@example.com.";
        }
        return "";
      case "phone":
        if (!value.trim()) {
          return "Please enter your 10 digit mobile number.";
        }
        if (!/^[6-9]\d{9}$/.test(value)) {
          return "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.";
        }
        return "";
      case "subject":
        if (!value.trim()) {
          return "Please choose a subject from the dropdown.";
        }
        return "";
      case "message":
        if (!value.trim()) {
          return "Please write a message.";
        }
        if (value.trim().length < 20) {
          return "Please write a message of at least 20 characters.";
        }
        return "";
      case "consent":
        if (!value) {
          return "You must agree to the Privacy Policy and data collection consent before submitting.";
        }
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const fieldError = validateField(name, fieldValue);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const validate = () => {
    const newErrors = {};

    ["name", "email", "phone", "subject", "message", "consent"].forEach(
      (field) => {
        const fieldError = validateField(field, formData[field]);
        if (fieldError) {
          newErrors[field] = fieldError;
        }
      },
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: "", message: "" });
    setSubmitAttempted(true);

    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.errors) {
          setErrors(result.errors);
        }
        setSubmitStatus({
          type: "error",
          message:
            result.message ||
            "Unable to send your message right now. Please try again.",
        });
        return;
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        consent: false,
        website: "",
      });
      setErrors({});
      setSubmitStatus({
        type: "success",
        message:
          result.message ||
          "Thanks for reaching out. We will get back to you shortly.",
      });
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
          Send us a Message
        </h2>

        {submitStatus.message && (
          <div
            role={submitStatus.type === "error" ? "alert" : "status"}
            aria-live={submitStatus.type === "error" ? "assertive" : "polite"}
            aria-atomic="true"
            className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
              submitStatus.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-neutral-700 mb-2"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.name
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-neutral-300 focus:border-lime-500 focus:ring-lime-500"
              } focus:outline-none focus:ring-2 transition-colors`}
              autoComplete="name"
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
              placeholder="e.g. Rahul Sharma"
            />
            {errors.name && (
              <p
                id="name-error"
                role="alert"
                className="mt-1 text-sm text-red-500"
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-neutral-700 mb-2"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-neutral-300 focus:border-lime-500 focus:ring-lime-500"
              } focus:outline-none focus:ring-2 transition-colors`}
              autoComplete="email"
              aria-invalid={errors.email ? "true" : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              placeholder="your.email@example.com"
              maxLength={120}
            />
            {errors.email && (
              <p
                id="email-error"
                role="alert"
                className="mt-1 text-sm text-red-500"
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-neutral-700 mb-2"
            >
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.phone
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-neutral-300 focus:border-lime-500 focus:ring-lime-500"
              } focus:outline-none focus:ring-2 transition-colors`}
              autoComplete="tel"
              aria-invalid={errors.phone ? "true" : undefined}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              placeholder="e.g. 9811735535"
              maxLength={10}
            />
            <p className="mt-1 text-xs text-neutral-500">
              Start with 6–9. No spaces, dashes, or country code.
            </p>
            {errors.phone && (
              <p
                id="phone-error"
                role="alert"
                className="mt-1 text-sm text-red-500"
              >
                {errors.phone}
              </p>
            )}
          </div>

          {/* Subject Field */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-semibold text-neutral-700 mb-2"
            >
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.subject
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-neutral-300 focus:border-lime-500 focus:ring-lime-500"
              } bg-white focus:outline-none focus:ring-2 transition-colors`}
              aria-invalid={errors.subject ? "true" : undefined}
              aria-describedby={errors.subject ? "subject-error" : undefined}
            >
              <option value="">— Please select —</option>
              <option value="general">General Inquiry</option>
              <option value="account">Account Support</option>
              <option value="billing">Billing & Pricing</option>
              <option value="feedback">Feedback / Suggestions</option>
              <option value="other">Other</option>
            </select>
            {errors.subject && (
              <p
                id="subject-error"
                role="alert"
                className="mt-1 text-sm text-red-500"
              >
                {errors.subject}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-neutral-700 mb-2"
            >
              Your Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="5"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.message
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-neutral-300 focus:border-lime-500 focus:ring-lime-500"
              } focus:outline-none focus:ring-2 transition-colors resize-none`}
              placeholder="Describe your enquiry in detail..."
              maxLength={2000}
              aria-invalid={errors.message ? "true" : undefined}
              aria-describedby={
                errors.message ? "message-error message-count" : "message-count"
              }
            ></textarea>
            <p className="mt-1 text-xs text-neutral-500">
              Minimum 20 characters. Maximum 2000 characters.
            </p>
            {errors.message && (
              <p
                id="message-error"
                role="alert"
                className="mt-1 text-sm text-red-500"
              >
                {errors.message}
              </p>
            )}
            <p
              id="message-count"
              className="mt-1 text-xs text-neutral-500 text-right"
            >
              {formData.message.length}/2000
            </p>
          </div>

          {/* Consent Field */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-2 h-4 w-4 rounded border-neutral-300 text-lime-600 focus:ring-lime-500"
              aria-invalid={errors.consent ? "true" : undefined}
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <div className="text-sm text-neutral-700">
              <label htmlFor="consent" className="font-semibold">
                I consent to SEBI-mandated KYC data collection and agree to the{" "}
                <a
                  href="/privacy-policy"
                  className="text-lime-700 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Privacy Policy
                </a>
                . <span className="text-red-500">*</span>
              </label>
              {errors.consent && (
                <p
                  id="consent-error"
                  role="alert"
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.consent}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 disabled:from-neutral-400 disabled:to-neutral-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending Message...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
