/**
 * JWT Token Management
 * 
 * SECURITY CRITICAL: JWT_SECRET must be:
 * - 32+ random characters (use crypto.randomBytes(32).toString('hex'))
 * - Never exposed or hardcoded
 * - Stored only in environment variables
 * - Rotated if compromised
 * 
 * Generate production secret:
 * node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

// ✅ SECURITY: Validate JWT secret on startup
if (!SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set');
}

if (SECRET.length < 32) {
  throw new Error(
    `FATAL: JWT_SECRET must be at least 32 characters (current: ${SECRET.length}). ` +
    `Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  );
}

if (SECRET === 'supersecretkey' || SECRET === 'your_super_strong_random_jwt_secret_here_min_32_chars') {
  throw new Error(
    'FATAL: JWT_SECRET is using default/example value. ' +
    'Generate a strong random secret with: ' +
    'node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
}

/**
 * Sign a JWT token
 * @param {Object} user - User object with _id, email, role
 * @returns {string} - Signed JWT token
 */
export const signToken = (user) =>
  jwt.sign(
    { 
      id: user._id.toString(), 
      email: user.email, 
      role: user.role 
    },
    SECRET,
    { expiresIn: "7d" }  // 7-day expiration
  );

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid
 */
export const verifyToken = (token) => jwt.verify(token, SECRET);
