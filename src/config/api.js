/**
 * Global API Configuration for G V Clothings B2B Platform
 * 
 * Configures the backend API base URL so that:
 * 1. Anyone cloning this GitHub repository and running `npm run dev` or building
 *    the frontend automatically connects to the deployed Render backend API:
 *    https://gv-clothings-backend.onrender.com
 *    and reads/writes live data from your single Google Firebase Firestore database.
 * 
 * 2. To point to a local or alternative backend, configure VITE_API_URL in your .env file:
 *    VITE_API_URL=http://localhost:5000
 * 
 * 3. Firebase service account credentials remain strictly on the backend as environment
 *    secrets and are NEVER exposed in the frontend or Git repository.
 */

export const DEFAULT_API_BASE_URL = 'https://gv-clothings-backend.onrender.com';

// Read from Vite environment variable (VITE_API_URL), or fallback to the deployed Render backend
const rawUrl = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL;

// Clean any trailing slashes to prevent double slashes in paths
export const API_BASE_URL = rawUrl.replace(/\/+$/, '');

/**
 * Helper to build an absolute URL for an API endpoint
 * 
 * @param {string} endpoint - Relative path (e.g. '/api/products' or 'api/enquiries')
 * @returns {string} - Absolute URL (e.g. 'https://gv-clothings-backend.onrender.com/api/products')
 */
export function apiUrl(endpoint = '') {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export default apiUrl;
