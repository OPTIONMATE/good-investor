import { verifyToken } from "@/app/lib/jwt";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { cookies } from "next/headers";

/**
 * Extracts and verifies JWT token from cookies
 * Returns decoded token payload or null if invalid/missing
 */
export async function getAuthToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * Retrieves authenticated user info from token
 * Returns { userId, email, role } or null
 */
export async function getAuthUser() {
  const decoded = await getAuthToken();
  if (!decoded) return null;
  return {
    userId: decoded.id,
    email: decoded.email,
    role: decoded.role || "user",
  };
}

/**
 * Validates if user is authenticated
 * Throws error if not authenticated
 */
export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }
  return user;
}

/**
 * Validates if user is admin
 * Throws error if not admin
 */
export async function requireAdmin() {
  const user = await getAuthUser();
  if (!user) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }

  await connectDB();
  const currentUser = await User.findById(user.userId).select("role").lean();

  if (!currentUser || currentUser.role !== "admin") {
    const error = new Error("Forbidden - Admin access required");
    error.statusCode = 403;
    throw error;
  }

  return { ...user, role: currentUser.role };
}

/**
 * Checks if user owns a specific resource
 * @param {string} resourceUserId - userId from resource (as string)
 * @param {string} currentUserId - current authenticated userId
 * @param {string} userRole - current user role
 * @returns {boolean} true if user owns resource or is admin
 */
export function userOwnsResource(resourceUserId, currentUserId, userRole) {
  const resourceIdStr = String(resourceUserId);
  const currentIdStr = String(currentUserId);
  return resourceIdStr === currentIdStr || userRole === "admin";
}
