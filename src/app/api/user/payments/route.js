import connectDB from "@/app/lib/db";
import Payment from "@/app/lib/models/Payment";
import Plan from "@/app/lib/models/Plan";
import { verifyToken } from "@/app/lib/jwt";
import { derivePurchasedDurationDays } from "@/app/lib/planValidity";
import { cookies } from "next/headers";

const normalizeText = (value) => String(value || "").trim();

const isUnknownPlanName = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  return !normalized || normalized === "unknown" || normalized === "unknown plan" || normalized === "n/a";
};

const isUnknownPlanType = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  return !normalized || normalized === "unknown" || normalized === "n/a";
};

const inferPlanForPayment = (payment, plans, plansByName) => {
  const paymentName = normalizeText(payment?.planName).toLowerCase();
  const paymentType = normalizeText(payment?.planType).toLowerCase();
  const paymentAmount = Number(payment?.amount || 0);

  if (paymentName && !isUnknownPlanName(paymentName)) {
    let candidates = plansByName.get(paymentName) || [];
    if (paymentType && !isUnknownPlanType(paymentType) && candidates.length > 1) {
      candidates = candidates.filter(
        (plan) => normalizeText(plan?.type).toLowerCase() === paymentType
      );
    }
    if (candidates.length === 1) {
      return candidates[0];
    }
  }

  if (Number.isFinite(paymentAmount) && paymentAmount > 0) {
    let amountCandidates = plans.filter(
      (plan) => Number(plan?.price || 0) === paymentAmount
    );

    if (paymentType && !isUnknownPlanType(paymentType) && amountCandidates.length > 1) {
      amountCandidates = amountCandidates.filter(
        (plan) => normalizeText(plan?.type).toLowerCase() === paymentType
      );
    }

    if (amountCandidates.length === 1) {
      return amountCandidates[0];
    }
  }

  return null;
};

export async function GET(req) {
  try {
    // Verify user is authenticated
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid token" }),
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    const normalizedEmail = String(decoded.email || "")
      .trim()
      .toLowerCase();

    const paymentQuery = {
      $or: [
        { userId: String(decoded.id || "") },
        { email: normalizedEmail },
      ],
    };

    // Get user's payments using robust identity lookup
    const payments = await Payment.find(paymentQuery)
      .sort({ createdAt: -1 })
      .lean();

    const plans = await Plan.find({})
      .select({ _id: 1, type: 1, name: 1, price: 1 })
      .lean();

    const planMap = new Map(plans.map((plan) => [String(plan._id), plan]));
    const plansByName = new Map();
    for (const plan of plans) {
      const key = normalizeText(plan?.name).toLowerCase();
      if (!key) continue;
      if (!plansByName.has(key)) {
        plansByName.set(key, []);
      }
      plansByName.get(key).push(plan);
    }

    const enrichedPayments = (payments || []).map((payment) => {
      const existingPlan = planMap.get(String(payment.planId || "").trim());
      const inferredPlan = existingPlan || inferPlanForPayment(payment, plans, plansByName);

      const resolvedPlanId = inferredPlan ? String(inferredPlan._id) : "";
      const resolvedPlanName =
        !isUnknownPlanName(payment?.planName)
          ? payment.planName
          : inferredPlan?.name || "Unknown Plan";
      const resolvedPlanType =
        !isUnknownPlanType(payment?.planType)
          ? payment.planType
          : inferredPlan?.type || "Unknown";

      // Purchased-duration display: snapshot first; for legacy records that
      // predate the snapshot, derive from STORED timestamps only (never the
      // current Plan config, never "today").
      const purchasedPlanDuration =
        Number(payment?.planDuration) > 0
          ? Number(payment.planDuration)
          : (derivePurchasedDurationDays(payment?.paidAt, payment?.expiresAt) ??
            null);

      return {
        ...payment,
        planId: payment.planId || resolvedPlanId,
        resolvedPlanId,
        planName: resolvedPlanName,
        planType: resolvedPlanType,
        planDuration: purchasedPlanDuration,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        payments: enrichedPayments,
        total: enrichedPayments.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user payments:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch payments",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
