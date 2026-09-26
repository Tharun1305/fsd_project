/**
 * Centralized API base URL configuration.
 *
 * Priority order:
 *  1. VITE_API_URL environment variable (set in .env or hosting env vars)
 *  2. Empty string '' (uses Vite proxy in dev; same-origin in production)
 *
 * For the deployed Render backend, set VITE_API_URL in your frontend host's
 * environment variables to the full Render service URL, e.g.:
 *   VITE_API_URL=https://gv-clothings-backend.onrender.com
 *
 * For local development, leave VITE_API_URL unset and the Vite proxy will
 * forward /api requests to http://localhost:5000.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Helper to build a full API endpoint URL.
 * @param {string} path - API path starting with /api/...
 * @returns {string}
 */
export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

/**
 * Safe fetch wrapper — always resolves (never throws).
 * Returns { ok, status, data } where data is the parsed JSON or null.
 *
 * Prevents "Unexpected end of JSON input" crashes when the backend
 * is unreachable or returns an empty / HTML response.
 *
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
export async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    let data = null;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    return { ok: res.ok, status: res.status, data };
  } catch (networkErr) {
    // Network error, CORS block, or server completely unreachable
    console.warn(`[API] Network error for ${url}:`, networkErr.message);
    return { ok: false, status: 0, data: null };
  }
}
