import { NextResponse } from "next/server";

/**
 * Safe API response helpers
 * Ensures consistent error handling and prevents data leakage
 */

/**
 * Success response
 */
export function successResponse(data, statusCode = 200) {
  return NextResponse.json(data, { status: statusCode });
}

/**
 * Error response - safe messages that don't expose internals
 */
export function errorResponse(message, statusCode = 400, details = null) {
  const response = {
    error: message,
  };

  // Only include details in development
  if (process.env.NODE_ENV === "development" && details) {
    response.details = details;
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized") {
  return errorResponse(message, 401);
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message = "Forbidden") {
  return errorResponse(message, 403);
}

/**
 * Not found response
 */
export function notFoundResponse(message = "Not found") {
  return errorResponse(message, 404);
}

/**
 * Validation error response
 */
export function validationErrorResponse(message = "Validation failed", errors = {}) {
  return NextResponse.json(
    {
      error: message,
      ...(process.env.NODE_ENV === "development" && { errors }),
    },
    { status: 400 }
  );
}

/**
 * Safe error handler for API routes
 * Catches errors and returns appropriate responses
 */
export async function safeApiHandler(handler) {
  try {
    return await handler();
  } catch (error) {
    console.error("API Error:", error.message);

    // Check for specific error types
    if (error.statusCode === 401) {
      return unauthorizedResponse(error.message);
    }

    if (error.statusCode === 403) {
      return forbiddenResponse(error.message);
    }

    if (error.statusCode === 404) {
      return notFoundResponse(error.message);
    }

    if (error.statusCode === 400) {
      return validationErrorResponse(error.message);
    }

    // Default: generic error message to prevent info leakage
    return errorResponse(
      "Something went wrong",
      500,
      error.message // Only shown in dev
    );
  }
}

/**
 * Sets secure cookie for production
 */
export function setSecureCookie(res, name, value, maxAge = 7 * 24 * 60 * 60) {
  res.cookies.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
  return res;
}

/**
 * Clears a cookie
 */
export function clearCookie(res, name) {
  res.cookies.set(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
