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

export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

/**
 * Wrapper around fetch that automatically includes cookies
 * and attempts refresh if 401 is returned
 */
export const apiFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not defined");
  }

  // Always include cookies
  let res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: "include",
  });

  const authEndpoints = [
    '/auth/refresh',
    '/auth/login',
    '/auth/register',
    '/auth/mfa/verify',
    '/auth/mfa/enable',
    '/auth/mfa/confirm',
    '/auth/mfa/status',
    '/auth/mfa/disable',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password'
  ];

  if (!authEndpoints.includes(url)) {
    if (res.status === 401) {
      // Attempt refresh
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        // Retry original request
        res = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          credentials: "include",
        });
      } else {
        window.location.href = "/login";
      }
    }
  }

  return res;
};

/**
 * Login user
 * Returns onboardingCompleted and other metadata from backend
 */
export const login = async (email: string, password: string) => {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, useMfa: true }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
};

/**
 * Register user
 * Returns onboardingCompleted and other metadata from backend
 */
export const register = async (email: string, password: string) => {
  const res = await apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, useMfa: true }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
};

/**
 * Forgot password
 * Returns success and other metadata from backend
 */
export const forgotPassword = async (email: string) => {
  const res = await apiFetch("/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
};

/**
 * Reset password
 * Returns success and other metadata from backend
 */
export const resetPassword = async (
  token: string,
  password: string,
  confirmPassword: string,
) => {
  const res = await apiFetch("/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password, confirmPassword }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
};

/**
 * Logout user
 * Backend should clear httpOnly cookies
 */
export const logout = async () => {
  await apiFetch("/auth/logout", { method: "POST", body: JSON.stringify({}) });
  window.location.href = "/login";
};

/**
 * Get current session / user info
 * Backend returns user info if access_token valid
 */
export const getCurrentUser = async () => {
  const res = await apiFetch("/users/me", { method: "GET" });

  if (!res.ok) return null;

  return res.json();
};

/**
 * Update current user / brand info
 * Backend updates user profile or brand info
 */
export const updateCurrentUser = async (payload: {
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    country?: string;
  };
  brand?: {
    name?: string;
    businessAddress?: string;
    size?: number;
    instagramUrl?: string;
    tiktokUrl?: string;
    facebookUrl?: string;
    googleUrl?: string;
  };
}) => {
  const res = await apiFetch("/users/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Update failed" }));
    throw err;
  }

  return res.json();
}

/**
 * Verify MFA code during login challenge
 */
export const verifyMFA = async (token: string) => {
  const res = await apiFetch('/auth/mfa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
};

/**
 * Trigger MFA setup (requires access_token)
 */
export const enableMFA = async () => {
  const res = await apiFetch('/auth/mfa/enable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}), // Empty object for Fastify
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
};

/**
 * Finalize MFA activation (requires access_token)
 */
export const confirmMFA = async (token: string) => {
  const res = await apiFetch('/auth/mfa/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.status === 201 ? { success: true } : res.json();
};

/**
 * Check current user's MFA status
 */
export const getMFAStatus = async () => {
  const res = await apiFetch('/auth/mfa/status', { method: 'GET' });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json(); // { status: true/false }
};

/**
 * Disable MFA
 */
export const disableMFA = async (token: string, password: string) => {
  const res = await apiFetch('/auth/mfa/disable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
};

/**
 * Update the current user's avatar
 * Backend expects: { avatarUrl: string, avatarEtag: string }
 */
export const updateUserAvatar = async (avatarUrl: string, avatarEtag: string) => {
  const res = await apiFetch('/users/me/user', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatarUrl, avatarEtag }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Avatar update failed' }));
    throw err;
  }

  return res.json();
};
