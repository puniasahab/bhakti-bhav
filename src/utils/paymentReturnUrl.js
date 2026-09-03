/**
 * Builds the Cashfree subscription return URL.
 *
 * Routes Cashfree's POST callback through the backend, which then issues a
 * GET redirect to the React SPA — avoiding 405 Method Not Allowed on Nginx.
 *
 * Backend endpoint (no JWT required):
 *   POST/GET /frontend/cashfree/subscription/return?redirect_url=<encoded>
 *   → 302 → /PaymentPay?subscription_id=SUB_...
 *
 * Override via REACT_APP_CASHFREE_SUBSCRIPTION_RETURN_URL env var
 * (e.g. for staging). If neither is set, falls back to direct frontend URL
 * (local dev only — will cause 405 in production).
 *
 * @param {string} frontendReturnUrl - The React route to land on after payment
 *   (e.g. `https://bhaktibhav.app/PaymentPay?subscription_id={subscription_id}`)
 * @returns {string} The URL Cashfree should POST to after payment completion.
 */

// Production backend endpoint that handles Cashfree's POST and redirects as GET.
// Not a secret — safe to hardcode. Override with env var for staging.
const CASHFREE_RETURN_BACKEND_URL =
  process.env.REACT_APP_CASHFREE_SUBSCRIPTION_RETURN_URL ||
  "https://api.bhaktibhav.app/api/v1/frontend/cashfree/subscription/return";

export function buildCashfreeReturnUrl(frontendReturnUrl) {
  const encoded = encodeURIComponent(frontendReturnUrl);
  return `${CASHFREE_RETURN_BACKEND_URL}?redirect_url=${encoded}`;
}

