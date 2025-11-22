/**
 * Authentication helper for server-side Netlify Functions
 * Verifies WordPress JWT tokens and extracts user information
 */

import { jwtVerify } from 'jose';

/**
 * Extract and verify user from request
 * Checks Authorization header for Bearer token
 *
 * @param {Object} event - Netlify function event object
 * @returns {Promise<Object|null>} User payload from verified JWT, or null if invalid
 */
export async function getUserFromRequest(event) {
  try {
    // Get token from Authorization header
    const authHeader = event.headers['authorization'] || event.headers['Authorization'];
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('[Auth] No token in Authorization header');
      return null;
    }

    // Verify JWT with server-side secret
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[Auth] JWT_SECRET not configured');
      return null;
    }

    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);

    console.log(`[Auth] Verified WordPress user ${payload.user_id}`);

    return payload;

  } catch (error) {
    console.error('[Auth] Token verification failed:', error.message);
    return null;
  }
}
