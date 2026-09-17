const CSRF_COOKIE_NAME = "__csrf_token__";
const CSRF_HEADER_NAME = "x-csrf-token";

function getCookieValue(name) {
  const prefix = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : "";
}

export function fetchWithCsrf(input, init = {}) {
  const headers = new Headers(init.headers || {});
  const token = getCookieValue(CSRF_COOKIE_NAME);

  if (!token) {
    // Never send a state-changing request without the header: the middleware
    // rejects it with 403, and because a 403 is a resolved response the caller
    // can mistake the failure for a success. Fail loudly instead.
    const url =
      typeof input === "string" ? input : input && input.url ? input.url : "the API";
    const message =
      `CSRF token cookie "${CSRF_COOKIE_NAME}" is missing or not readable by JavaScript, ` +
      `so the "${CSRF_HEADER_NAME}" header cannot be sent to ${url}. The request was not ` +
      `sent. Reload the page so the server can re-issue a readable CSRF cookie.`;
    console.error(`[fetchWithCsrf] ${message}`);
    // Rejected promise (not a synchronous throw) so callers using either
    // `await`/try-catch or `.catch()` observe the failure.
    return Promise.reject(new Error(message));
  }

  headers.set(CSRF_HEADER_NAME, token);

  return fetch(input, { ...init, headers });
}
