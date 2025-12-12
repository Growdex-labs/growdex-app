// lib/auth.ts
/**
 * Secure cookie-based auth utilities for Next.js
 *
 * Backend sets:
 * - access_token (httpOnly, short-lived)
 * - refresh_token (httpOnly, long-lived)
 *
 * Frontend never touches tokens directly.
 * Use `apiFetch` for all authenticated requests.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Wrapper around fetch that automatically includes cookies
 * and attempts refresh if 401 is returned
 */
export const apiFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Always include cookies
  let res = await fetch(`${baseUrl}${url}`, {
    ...options,
    credentials: 'include',
  });

  if (res.status === 401) {
    // Attempt refresh
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      // Retry original request
      res = await fetch(`${baseUrl}${url}`, {
        ...options,
        credentials: 'include',
      });
    }
  }

  return res;
};

/**
 * Login user
 * Returns onboardingCompleted and other metadata from backend
 */
export const login = async (email: string, password: string) => {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error || 'Login failed');
  }

  return res.json();
};

/**
 * Register user
 * Returns onboardingCompleted and other metadata from backend
 */
export const register = async (email: string, password: string) => {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error || 'Registration failed');
  }

  return res.json();
};

/**
 * Logout user
 * Backend should clear httpOnly cookies
 */
export const logout = async () => {
  await apiFetch('/auth/logout', { method: 'POST' });
};

/**
 * Get current session / user info
 * Backend returns user info if access_token valid
 */
export const getCurrentUser = async () => {
  const res = await apiFetch('/users/me', { method: 'GET' });

  if (!res.ok) return null;

  return res.json();
};
