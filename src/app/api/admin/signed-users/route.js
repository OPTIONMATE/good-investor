import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import SignedAgreement from "@/app/lib/models/SignedAgreement";
import User from "@/app/lib/models/User";
import Payment from "@/app/lib/models/Payment";
import mongoose from "mongoose";
import { requireAdmin } from "@/app/lib/authServer";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const signedAgreements = await SignedAgreement.find({})
      .lean()
      .sort({ signedTimestamp: -1 });

    if (!signedAgreements.length) {
      return NextResponse.json({ signedUsers: [] });
    }

    const userIds = [...new Set(signedAgreements.map((a) => a.userId).filter(Boolean))];
    const emails = [
      ...new Set(
        signedAgreements
          .map((a) => String(a.clientEmail || "").toLowerCase().trim())
          .filter(Boolean),
      ),
    ];

    const objectIdUserIds = userIds.filter((id) => mongoose.Types.ObjectId.isValid(String(id)));

    const userOrFilters = [{ email: { $in: emails } }];
    if (objectIdUserIds.length > 0) {
      userOrFilters.unshift({ _id: { $in: objectIdUserIds } });
    }

    const users = await User.find({
      $or: userOrFilters,
    })
      .lean()
      .select("_id email fullName dob phone state panNumber agreementMailedToUser mitcMailedToUser kycUpdatedByAdmin invoiceMailedToUser agreementMailedAt invoiceMailedAt");

    // Exact payments for the agreements that already carry a paymentId link
    // (Agreement A → Payment A). Legacy agreements without the link fall back
    // to the historical latest-payment-per-user behaviour below.
    const linkedPaymentIds = [
      ...new Set(
        signedAgreements
          .map((a) => String(a.paymentId || "").trim())
          .filter((id) => mongoose.Types.ObjectId.isValid(id)),
      ),
    ];
    const linkedPaymentById = new Map();
    if (linkedPaymentIds.length > 0) {
      const linkedPayments = await Payment.find({
        _id: { $in: linkedPaymentIds },
      }).lean();
      for (const p of linkedPayments) {
        linkedPaymentById.set(String(p._id), p);
      }
    }

    const payments = await Payment.find({
      $or: [{ userId: { $in: userIds } }, { email: { $in: emails } }],
    })
      .lean()
      .sort({ paidAt: -1 });

    const userById = new Map(users.map((u) => [String(u._id), u]));
    const userByEmail = new Map(
      users
        .filter((u) => u.email)
        .map((u) => [String(u.email).toLowerCase().trim(), u]),
    );

    const paymentByUserId = new Map();
    const paymentByEmail = new Map();

    for (const p of payments) {
      if (p.userId && !paymentByUserId.has(String(p.userId))) {
        paymentByUserId.set(String(p.userId), p);
      }
      if (p.email) {
        const key = String(p.email).toLowerCase().trim();
        if (!paymentByEmail.has(key)) {
          paymentByEmail.set(key, p);
        }
      }
    }

    const signedUsers = signedAgreements.map((agreement) => {
      const emailKey = String(agreement.clientEmail || "").toLowerCase().trim();
      const user = userById.get(String(agreement.userId)) || userByEmail.get(emailKey) || {};
      // Exact link first (paymentId → Payment._id). Only when THIS agreement
      // has no usable link do we use the legacy latest-payment-per-user lookup.
      // A linked payment is accepted only if it belongs to the same user/email
      // as the agreement, so a forged paymentId can never attach someone
      // else's payment to this row.
      let payment = null;
      const agreementPaymentId = String(agreement.paymentId || "").trim();
      if (agreementPaymentId && mongoose.Types.ObjectId.isValid(agreementPaymentId)) {
        const candidate = linkedPaymentById.get(agreementPaymentId) || null;
        if (candidate) {
          const candidateUserId = candidate.userId ? String(candidate.userId) : "";
          const candidateEmail = candidate.email
            ? String(candidate.email).toLowerCase().trim()
            : "";
          const sameOwner =
            (candidateUserId && candidateUserId === String(agreement.userId)) ||
            (candidateEmail && emailKey && candidateEmail === emailKey);
          payment = sameOwner ? candidate : null;
        } else {
          // Stale/dangling paymentId: never attach an unrelated payment.
          payment = null;
        }
      } else {
        payment =
          paymentByUserId.get(String(agreement.userId)) ||
          paymentByEmail.get(emailKey) ||
          null;
      }

      const validTill = payment?.expiresAt || null;
      const renewalDate = validTill
        ? new Date(new Date(validTill).getTime() + 24 * 60 * 60 * 1000)
        : null;

      // Helper to clean and validate data
      const cleanValue = (val) => {
        if (!val) return null;
        const str = String(val).trim();
        return str && str !== "NOT_PROVIDED" && str !== "N/A" && str !== "Unknown" ? str : null;
      };

      return {
        _id: agreement._id,
        userId: agreement.userId,
        paymentId: agreement.paymentId || null,
        // Prioritize Agreement data (captured at signing time) over User profile
        name: cleanValue(agreement.clientName) || cleanValue(user.fullName) || "N/A",
        pan: cleanValue(agreement.clientPan) || cleanValue(user.panNumber) || "N/A",
        dob: cleanValue(agreement.clientDob) || cleanValue(user.dob) || "—",
        dateOfConsent: agreement.signedTimestamp || null,
        email: cleanValue(agreement.clientEmail) || cleanValue(user.email) || "N/A",
        mobile: cleanValue(agreement.clientPhone) || cleanValue(user.phone) || "—",
        state: cleanValue(agreement.clientState) || cleanValue(user.state) || "—",
        serviceName:
          cleanValue(payment?.planName) || cleanValue(agreement.signedPlanName) || "—",
        // Per-agreement source of truth first; User flag only as legacy fallback
        // for agreements mailed before agreement-level tracking existed.
        // A User-level `true` never marks OTHER agreements: it applies only when
        // THIS agreement has no agreement-level value yet (undefined/null).
        agreementMailedToUser: Boolean(
          agreement.agreementMailedToUser ?? user.agreementMailedToUser
        ),
        agreementMailedAt: agreement.agreementMailedAt ?? user.agreementMailedAt ?? null,
        mitcMailedToUser: Boolean(user.mitcMailedToUser),
        kycUpdatedByAdmin: Boolean(user.kycUpdatedByAdmin),
        validFrom: payment?.paidAt || null,
        validTill,
        renewalDate,
        invoiceMailedToUser: Boolean(user.invoiceMailedToUser),
        invoiceMailedAt: user.invoiceMailedAt ?? null,
      };
    });

    return NextResponse.json({ signedUsers });
  } catch (error) {
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.statusCode === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching signed users:", error);
    return NextResponse.json(
      { error: "Failed to fetch signed users", signedUsers: [] },
      { status: 500 },
    );
  }
}
