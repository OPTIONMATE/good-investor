/**
 * ROOT MIDDLEWARE for Next.js 16 (src/middleware.js)
 *
 * Executes for ALL requests before they reach route handlers
 * Adds security headers, CSRF validation, authentication checks
 *
 * IMPORTANT: This file MUST be at src/middleware.js (root of src/)
 * NOT in src/lib/middleware.js
 */

import { NextResponse } from "next/server";
import {
  verifyCSRFToken,
  setCSRFCookie,
  getCSRFToken,
} from "./app/lib/csrfProtection";

/**
 * Security Headers
 * Protects against XSS, clickjacking, MIME sniffing, etc.
 */
function setSecurityHeaders(response) {
  // Content Security Policy (CSP)
  // Prevents inline scripts, external script injection, etc.
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.cloudinary.com *.razorpay.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "img-src 'self' data: https: *.cloudinary.com",
      "font-src 'self' data: fonts.gstatic.com",
      "connect-src 'self' https: wss: *.razorpay.com *.cloudinary.com maps.googleapis.com maps.google.com www.google.com",
      "frame-src 'self' *.razorpay.com maps.google.com www.google.com",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  );

  // X-Frame-Options - Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // X-Content-Type-Options - Prevent MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // X-XSS-Protection - Legacy XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy - Protect privacy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy - Restrict browser features
  response.headers.set(
    "Permissions-Policy",
    [
      "geolocation=()",
      "microphone=()",
      "camera=()",
      "payment=(self)",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
    ].join(","),
  );

  // Strict-Transport-Security (HSTS) - Enforce HTTPS
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}

/**
 * Main middleware function
 */
export async function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  const method = request.method.toUpperCase();

  // Create response
  let response = NextResponse.next();

  // 1. Add security headers to all responses
  response = setSecurityHeaders(response);

  // 2. Ensure CSRF token exists in session
  // (Will be set as cookie for client to use)
  //
  // Re-issued on every matched request, reusing the existing value when present.
  // Browsers never report the HttpOnly flag back in the Cookie header, so a
  // legacy HttpOnly CSRF cookie cannot be detected any other way — re-issuing it
  // in place is what upgrades it to a JS-readable (httpOnly:false) cookie. The
  // VALUE is preserved so in-flight state-changing requests whose header was
  // built from the existing token keep matching; only a client with no cookie at
  // all gets a freshly generated token.
  const csrfToken = getCSRFToken(request);
  setCSRFCookie(response, csrfToken);

  // 3. CSRF protection for state-changing requests
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  const isStateChangingRequest = !safeMethods.includes(method);

  // Routes that don't need CSRF protection (already have their own)
  const csrfExemptRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/verify-otp",
    "/api/auth/resend-otp",
    "/api/auth/google",
    "/api/auth/admin/", // Admin auth endpoints (signup, OTP)
    "/api/contact",
    "/api/payment/verify", // Razorpay webhook doesn't have CSRF token
    "/api/payment/order", // Payment order endpoint uses JWT authentication
  ];

  const isExempt = csrfExemptRoutes.some((route) => pathname.startsWith(route));

  if (isStateChangingRequest && !isExempt) {
    // Validate CSRF token for POST/PUT/DELETE requests
    const isValid = await verifyCSRFToken(request);
    if (!isValid) {
      console.warn(`CSRF validation failed: ${method} ${pathname}`);
      return NextResponse.json(
        { error: "CSRF token validation failed" },
        { status: 403 },
      );
    }
  }

  // 4. Redirect HTTP to HTTPS in production
  if (
    process.env.NODE_ENV === "production" &&
    process.env.FORCE_HTTPS === "true"
  ) {
    if (request.headers.get("x-forwarded-proto") !== "https") {
      return NextResponse.redirect(
        `https://${request.headers.get("host")}${pathname}${
          searchParams.toString() ? "?" + searchParams.toString() : ""
        }`,
        { status: 308 },
      );
    }
  }

  // 5. Authentication check for protected routes
  const protectedRoutes = ["/dashboard", "/admin"];
  const token = request.cookies.get("token")?.value;

  if (protectedRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 6. Add security response headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

/**
 * Configure which routes the middleware runs on
 * This runs middleware only on these patterns
 */
export const config = {
  matcher: [
    // Run on all routes except static files and next internals
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)",
  ],
};
