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
