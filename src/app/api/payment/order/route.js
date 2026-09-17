import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Plan from "@/app/lib/models/Plan";
import Coupon from "@/app/lib/models/Coupon";
import Payment from "@/app/lib/models/Payment";
import { verifyToken } from "@/app/lib/jwt";
import { isValidObjectId } from "@/app/lib/validators";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { planId, couponCode } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "Plan is required" },
        { status: 400 },
      );
    }

    // ✅ SECURITY: Validate ObjectId before passing to Plan.findById
    if (!isValidObjectId(String(planId).trim())) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 },
      );
    }

    const plan = await Plan.findById(planId).lean();
    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: "Selected plan is unavailable" },
        { status: 400 },
      );
    }

    // Resolve current user email from auth cookie first, then fallback to payload.
    let effectiveEmail = "";
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (token) {
        const decoded = verifyToken(token);
        effectiveEmail = String(decoded?.email || "")
          .trim()
          .toLowerCase();
      }
    } catch {
      // Non-blocking: order can still proceed for unauthenticated sessions.
    }

    if (!effectiveEmail && body?.email) {
      effectiveEmail = String(body.email).trim().toLowerCase();
    }

    if (effectiveEmail) {
      const activeExistingSubscription = await Payment.findOne({
        email: effectiveEmail,
        planId: String(plan._id),
        expiresAt: { $gt: new Date() },
      })
        .sort({ expiresAt: -1 })
        .lean();

      if (activeExistingSubscription) {
        return NextResponse.json(
          {
            error:
              "You already have an active subscription for this plan. Please renew after expiry.",
            code: "ACTIVE_SUBSCRIPTION_EXISTS",
            activeUntil: activeExistingSubscription.expiresAt,
          },
          { status: 409 },
        );
      }
    }

    const baseAmount = Number(plan.price);
    if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid plan amount" },
        { status: 400 },
      );
    }

    let appliedCouponCode = null;
    let discountAmount = 0;
    let finalAmount = baseAmount;

    if (couponCode) {
      const normalizedCode = String(couponCode).trim().toUpperCase();
      const coupon = await Coupon.findOne({
        code: normalizedCode,
        isActive: true,
      }).lean();

      if (!coupon) {
        return NextResponse.json(
          { error: "Invalid or inactive coupon code" },
          { status: 400 },
        );
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json(
          { error: "Coupon usage limit reached" },
          { status: 400 },
        );
      }

      appliedCouponCode = coupon.code;
      discountAmount =
        coupon.discountType === "percentage"
          ? (baseAmount * Number(coupon.discountValue || 0)) / 100
          : Number(coupon.discountValue || 0);

      finalAmount = Math.max(1, Math.round(baseAmount - discountAmount));
      discountAmount = Math.max(0, Math.round(baseAmount - finalAmount));
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment gateway is not configured" },
        { status: 500 },
      );
    }

    const Razorpay =
      (await import("razorpay")).default || (await import("razorpay"));
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: finalAmount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        planId: String(plan._id),
        planName: plan.name,
        planType: plan.type,
        baseAmount: String(baseAmount),
        discountAmount: String(discountAmount),
        finalAmount: String(finalAmount),
        couponCode: appliedCouponCode || "",
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order,
      keyId,
      pricing: {
        planId: String(plan._id),
        planName: plan.name,
        planType: plan.type,
        baseAmount,
        discountAmount,
        finalAmount,
        couponCode: appliedCouponCode,
      },
    });
  } catch (err) {
    console.error("RAZORPAY ORDER ERROR:", err);
    return NextResponse.json(
      {
        error: "Order creation failed",
        details: err.message,
      },
      { status: 500 },
    );
  }
}
