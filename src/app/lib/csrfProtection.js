/**
 * CSRF Protection Module
 * Implements double-submit cookie pattern
 * 
 * Flow:
 * 1. Server generates random token
 * 2. Server sets as HttpOnly cookie + sends in response
 * 3. Client sends token in X-CSRF-Token header on state-changing requests
 * 4. Server validates header matches cookie
 */

const CSRF_COOKIE_NAME = '__csrf_token__';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

function toHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken() {
  const bytes = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

/**
 * Set CSRF token as a readable double-submit cookie
 *
 * Reuses `existingToken` when one is supplied so an already-issued cookie can be
 * re-issued in place (it needs to be, in order to upgrade a legacy HttpOnly
 * cookie into a JS-readable one) WITHOUT rotating the token value. Rotating the
 * value here would invalidate the header of any state-changing request that was
 * already prepared from the previous value.
 *
 * @param {Response} response - Next.js response to attach the cookie to
 * @param {string} [existingToken] - token already issued to this client, if any
 * @returns {string} the token value that is now set on the response
 */
export function setCSRFCookie(response, existingToken) {
  const token = existingToken || generateCSRFToken();
  
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });
  
  return token;
}

/**
 * Verify CSRF token from request
 * Checks that X-CSRF-Token header matches cookie
 * 
 * @param {Request} request - Next.js request object
 * @returns {boolean} - true if token is valid, false otherwise
 */
export async function verifyCSRFToken(request) {
  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (!headerToken) {
    console.warn('CSRF: Missing X-CSRF-Token header');
    return false;
  }
  
  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!cookieToken) {
    console.warn('CSRF: Missing CSRF cookie');
    return false;
  }
  
  // Compare tokens in constant time
  const match = constantTimeEqual(headerToken, cookieToken);
  
  if (!match) {
    console.warn('CSRF: Token mismatch');
  }
  
  return match;
}

/**
 * Get CSRF token from cookies
 * Used to send to client for next request
 */
export function getCSRFToken(request) {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value;
}

/**
 * Clear CSRF token (on logout)
 */
export function clearCSRFToken(response) {
  response.cookies.set(CSRF_COOKIE_NAME, '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

/**
 * Middleware to validate CSRF for state-changing methods
 * Allow: GET, HEAD, OPTIONS
 * Require CSRF: POST, PUT, DELETE, PATCH
 */
export async function validateCSRF(request) {
  const method = request.method.toUpperCase();
  
  // Skip CSRF validation for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(method)) {
    return true;
  }
  
  // Validate CSRF for state-changing methods
  return await verifyCSRFToken(request);
}
