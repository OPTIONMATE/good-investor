"use client";

import { useMemo, useState } from "react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";
import { useAuth } from "@/app/context/AuthContext";
import { profileValueFromUserRecord, sanitizeProfileInput } from "@/app/lib/profileFields";
import {
  BuyActions,
  BuyField,
  buyErrorClass,
  buyInfoClass,
  buyInputClass,
  buyPrimaryButtonClass,
  buySecondaryButtonClass,
} from "./BuyFlowShell";

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const EMPTY_FORM = {
  fullName: "",
  dob: "",
  gender: "",
  state: "",
  email: "",
  phone: "",
  panNumber: "",
};

// Exactly the fields POST /api/buy/start accepts — so these are the only fields
// that may be pre-filled from the account record.
const AUTOFILL_FIELDS = [
  "fullName",
  "dob",
  "gender",
  "state",
  "email",
  "phone",
  "panNumber",
];

export default function BuyDetailsForm({ onSuccess, onBack }) {
  const { user, loading: authLoading } = useAuth();
  // Only the values the user actually typed live in state. Every other field
  // falls back to the account record, so the database provides *initial* values
  // while the form keeps full ownership of what gets submitted.
  const [edits, setEdits] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initial values taken from the authenticated user already in app state
  // (GET /api/auth/me via AuthContext) — no extra request, no new endpoint.
  const prefilled = useMemo(() => {
    const values = {};
    if (!user) return values;
    for (const field of AUTOFILL_FIELDS) {
      const value = profileValueFromUserRecord(field, user[field]);
      if (value) values[field] = value;
    }
    return values;
  }, [user]);

  // User edits always win over the account record (edit a field, clear it, or
  // replace it and the change sticks — the record never re-applies).
  const form = useMemo(
    () => ({ ...EMPTY_FORM, ...prefilled, ...edits }),
    [prefilled, edits],
  );

  // Fields that came from the account and the user has not touched yet.
  const prefilledFields = Object.keys(prefilled).filter(
    (field) => !(field in edits),
  );

  const update = (event) => {
    const { name, value } = event.target;
    setEdits((prev) => ({ ...prev, [name]: sanitizeProfileInput(name, value) }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    // DOB validation — the user must be at least 18 years old.
    if (!form.dob) {
      setError("Date of Birth is required");
      return;
    }

    const dob = new Date(form.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      setError("You must be at least 18 years old to proceed");
      return;
    }

    if (!form.phone || String(form.phone).trim() === "") {
      setError("Phone number is required");
      return;
    }

    if (String(form.phone).replace(/\D/g, "").length < 10) {
      setError("Phone number must be at least 10 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithCsrf("/api/buy/start", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Could not save your details. Please try again.");
        return;
      }

      onSuccess(form);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // A stored state that is not in the list still has to render, otherwise the
  // select would silently fall back to the placeholder.
  const hasUnknownState = Boolean(form.state) && !STATES.includes(form.state);

  // "Saved" marks a field whose value came from the account record and the
  // user has not touched yet. It disappears as soon as the user types, so a
  // pre-filled value and a typed value never look ambiguous.
  const savedBadgeFor = (field) =>
    prefilledFields.includes(field) ? "Saved" : undefined;

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {prefilledFields.length > 0 && (
        <p className={buyInfoClass}>
          Details already saved on your account are shown inside the boxes
          below. Every box is editable — click any value to change it.
        </p>
      )}
      {authLoading && prefilledFields.length === 0 && (
        <p className="text-xs text-neutral-500">Loading your saved details…</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <BuyField
          label="Full Name"
          htmlFor="buy-full-name"
          badge={savedBadgeFor("fullName")}
          className="sm:col-span-2"
        >
          <input
            id="buy-full-name"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            value={form.fullName}
            onChange={update}
            className={buyInputClass}
          />
        </BuyField>

        <BuyField
          label="Date of Birth"
          htmlFor="buy-dob"
          hint="You must be 18 years or older."
          badge={savedBadgeFor("dob")}
        >
          <input
            id="buy-dob"
            name="dob"
            type="date"
            value={form.dob}
            onChange={update}
            className={buyInputClass}
          />
        </BuyField>

        <BuyField
          label="Gender"
          htmlFor="buy-gender"
          badge={savedBadgeFor("gender")}
        >
          <select
            id="buy-gender"
            name="gender"
            value={form.gender}
            onChange={update}
            className={buyInputClass}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </BuyField>

        <BuyField
          label="State"
          htmlFor="buy-state"
          badge={savedBadgeFor("state")}
          className="sm:col-span-2"
        >
          <select
            id="buy-state"
            name="state"
            value={form.state}
            onChange={update}
            className={buyInputClass}
          >
            <option value="">Select state / UT</option>
            {hasUnknownState && (
              <option value={form.state}>{form.state}</option>
            )}
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </BuyField>

        <BuyField
          label="Email"
          htmlFor="buy-email"
          badge={savedBadgeFor("email")}
        >
          <input
            id="buy-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update}
            className={buyInputClass}
          />
        </BuyField>

        <BuyField
          label="Phone Number"
          htmlFor="buy-phone"
          badge={savedBadgeFor("phone")}
        >
          <input
            id="buy-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={update}
            className={buyInputClass}
          />
        </BuyField>

        <BuyField
          label="PAN Number"
          htmlFor="buy-pan"
          hint="Format: AAAAA9999A"
          badge={savedBadgeFor("panNumber")}
          className="sm:col-span-2 sm:max-w-sm"
        >
          <input
            id="buy-pan"
            name="panNumber"
            type="text"
            maxLength={10}
            autoCapitalize="characters"
            placeholder="AAAAA9999A"
            value={form.panNumber}
            onChange={update}
            className={`${buyInputClass} uppercase`}
          />
        </BuyField>
      </div>

      {error && (
        <p role="alert" aria-live="assertive" className={buyErrorClass}>
          {error}
        </p>
      )}

      <BuyActions>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={buySecondaryButtonClass}
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className={buyPrimaryButtonClass}
        >
          {loading ? "Sending OTP..." : "Save & send OTP"}
        </button>
      </BuyActions>
    </form>
  );
}

