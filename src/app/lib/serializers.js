/**
 * Serializers to safely return user data without sensitive fields
 */

/**
 * Serialize user object - removes password, OTP, and internal fields
 */
export function serializeUser(user) {
  if (!user) return null;

  const obj = user.toObject ? user.toObject() : user;
  const { password, emailOtp, emailOtpExpiry, ...safe } = obj;
  return safe;
}

/**
 * Serialize multiple users
 */
export function serializeUsers(users) {
  return users.map(serializeUser);
}

/**
 * Serialize auth response - minimal user data
 */
export function serializeAuthUser(user) {
  const safe = serializeUser(user);
  return {
    _id: safe._id,
    email: safe.email,
    username: safe.username,
    fullName: safe.fullName,
    dob: safe.dob,
    gender: safe.gender,
    state: safe.state,
    panNumber: safe.panNumber,
    phone: safe.phone,
    role: safe.role,
    emailVerified: safe.emailVerified,
    disclaimerAccepted: Boolean(safe.disclaimerAccepted),
  };
}

/**
 * Serialize payment - removes PII if needed
 */
export function serializePayment(payment) {
  if (!payment) return null;
  return {
    _id: payment._id,
    orderId: payment.orderId,
    email: payment.email,
    amount: payment.amount,
    status: payment.status,
    planId: payment.planId,
    planName: payment.planName,
    planType: payment.planType,
    planDuration: payment.planDuration,
    paidAt: payment.paidAt,
    expiresAt: payment.expiresAt,
    createdAt: payment.createdAt,
    razorpay_payment_id: payment.razorpay_payment_id,
  };
}

/**
 * Serialize invoice - removes sensitive customer data if needed
 */
export function serializeInvoice(invoice) {
  if (!invoice) return null;
  return {
    _id: invoice._id,
    clientName: invoice.clientName,
    amount: invoice.amount,
    planId: invoice.planId,
    planName: invoice.planName,
    planType: invoice.planType,
    planDuration: invoice.planDuration,
    startDate: invoice.startDate,
    endDate: invoice.endDate,
    createdAt: invoice.createdAt,
  };
}

/**
 * Serialize agreement - removes signature data from list views
 */
export function serializeAgreement(agreement, includeDetails = false) {
  if (!agreement) return null;

  const obj = agreement.toObject ? agreement.toObject() : agreement;

  const safe = {
    _id: obj._id,
    clientName: obj.clientName,
    clientEmail: obj.clientEmail,
    status: obj.status,
    createdAt: obj.createdAt,
    signedTimestamp: obj.signedTimestamp,
  };

  if (includeDetails) {
    safe.fileName = obj.fileName;
    safe.fileUrl = obj.fileUrl;
    safe.downloadCount = obj.downloadCount;
  }

  return safe;
}

/**
 * Serialize risk profile - removes sensitive fields where needed
 */
export function serializeRiskProfile(profile) {
  if (!profile) return null;

  return {
    _id: profile._id,
    userId: profile.userId,
    username: profile.username,
    email: profile.email,
    answers: profile.answers,
    createdAt: profile.createdAt,
  };
}
