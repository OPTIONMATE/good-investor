import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { signToken } from "@/app/lib/jwt";
import { sendTermsAndConditionsMail } from "@/app/lib/mailer";
import { setSecureCookie } from "@/app/lib/apiHelpers";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${process.env.PUBLIC_BASE_URL}/login`
    );
  }

  // Exchange code for token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.PUBLIC_BASE_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  // Fetch user info
  const userInfo = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    }
  ).then((r) => r.json());

  await connectDB();

  let user = await User.findOne({ email: userInfo.email });
  let isNewUser = false;
  if (!user) {
    user = await User.create({
      email: userInfo.email,
      googleId: userInfo.id,
      username: userInfo.name || userInfo.email?.split("@")[0] || "User",
      disclaimerAccepted: false,
    });
    isNewUser = true;
  } else if (!user.username) {
    user.username = userInfo.name || userInfo.email?.split("@")[0] || "User";
    await user.save();
  }

  if (!user.role) {
    user.role = "user";
  }
  
  // Update login tracking
  user.lastLoginAt = new Date();
  user.authProvider = "google";
  user.emailVerified = true;
  await user.save();

  const jwt = signToken(user);

  if (isNewUser) {
    sendTermsAndConditionsMail(user.email).catch((err) =>
      console.error("TERMS MAIL ERROR (GOOGLE, NON-BLOCKING)", err)
    );
  }

  // ✅ ABSOLUTE URL REQUIRED
  const redirectUrl = user.disclaimerAccepted
    ? `${process.env.PUBLIC_BASE_URL}/`
    : `${process.env.PUBLIC_BASE_URL}/disclaimer`;

  const res = NextResponse.redirect(redirectUrl);

  // ✅ SECURITY: Use setSecureCookie utility for consistent cookie handling
  setSecureCookie(res, "token", jwt, 7 * 24 * 60 * 60); // 7 days

  return res;
}
