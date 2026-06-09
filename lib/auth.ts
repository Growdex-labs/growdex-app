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

const compactOptionalFields = <T extends Record<string, unknown>>(value: T): T => {
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      if (entry === "") return [];
      if (
        entry &&
        typeof entry === "object" &&
        !Array.isArray(entry)
      ) {
        const compacted = compactOptionalFields(entry as Record<string, unknown>);
        return Object.keys(compacted).length ? [[key, compacted]] : [];
      }
      return [[key, entry]];
    }),
  ) as T;
};

const getMockResponse = (url: string, options?: RequestInit): Response => {
  let data: any = { success: true };

  if (url === "/users/me") {
    let mockAvatar: string | null = null;
    let mockProfileStr = null;
    let mockBrandStr = null;
    if (typeof window !== "undefined") {
      mockAvatar = localStorage.getItem("mock_avatar_url");
      mockProfileStr = localStorage.getItem("mock_profile");
      mockBrandStr = localStorage.getItem("mock_brand");
    }

    data = {
      email: "devtest@growdex.io",
      avatarUrl: mockAvatar,
      onboardingCompleted: true,
      profile: mockProfileStr ? JSON.parse(mockProfileStr) : {
        id: "mock-id",
        firstName: "Dev",
        lastName: "User",
        phone: "1234567890",
        country: "United States",
      },
      brand: mockBrandStr ? JSON.parse(mockBrandStr) : {
        id: "mock-brand-id",
        name: "Mock Brand",
        size: 10,
        businessAddress: "123 Dev Street",
        instagramUrl: "https://instagram.com/mock",
        facebookUrl: "https://facebook.com/mock",
        googleUrl: "https://google.com/mock",
        twitterUrl: "https://twitter.com/mock",
      },
      platformConnections: [
        { platform: "meta", accountName: "Growdex Meta Ads", accountId: "mock-meta-123", status: "active" },
        { platform: "tiktok", accountName: "Growdex TikTok Ads", accountId: "mock-tiktok-456", status: "active" },
      ],
    };
  } else if (url === "/users/me/user") {
    if (options?.body && typeof window !== "undefined") {
      try {
        const bodyObj = JSON.parse(options.body as string);
        if (bodyObj.avatarUrl !== undefined) {
          localStorage.setItem("mock_avatar_url", bodyObj.avatarUrl);
        }
      } catch (e) {}
    }
  } else if (url === "/users/me" && options?.method === "PATCH") {
    if (options?.body && typeof window !== "undefined") {
      try {
        const bodyObj = JSON.parse(options.body as string);
        if (bodyObj.profile) {
          const currentProfile = localStorage.getItem("mock_profile")
            ? JSON.parse(localStorage.getItem("mock_profile")!)
            : { firstName: "Dev", lastName: "User", phone: "1234567890", country: "United States" };
          localStorage.setItem("mock_profile", JSON.stringify({ ...currentProfile, ...bodyObj.profile }));
        }
        if (bodyObj.brand) {
          const currentBrand = localStorage.getItem("mock_brand")
            ? JSON.parse(localStorage.getItem("mock_brand")!)
            : { name: "Mock Brand", size: 10, businessAddress: "123 Dev Street", instagramUrl: "https://instagram.com/mock", facebookUrl: "https://facebook.com/mock", googleUrl: "https://google.com/mock", twitterUrl: "https://twitter.com/mock" };
          localStorage.setItem("mock_brand", JSON.stringify({ ...currentBrand, ...bodyObj.brand }));
        }
      } catch (e) {}
    }
  } else if (url === "/users/ad-accounts/billing") {
    data = [
      { platform: "meta", billingUrl: "https://www.facebook.com/ads/manager/billing" },
      { platform: "tiktok", billingUrl: "https://ads.tiktok.com/i18n/dashboard" }
    ];
  } else if (url === "/media/signature-stamp") {
    data = {
      signature: "mock_signature",
      timestamp: Math.floor(Date.now() / 1000),
      api_key: "mock_api_key",
    };
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

/**
 * Wrapper around fetch that automatically includes cookies
 * and attempts refresh if 401 is returned
 */
export const apiFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const isDev = process.env.NEXT_PUBLIC_APP_ENV === 'development';
  const hasDevSession = typeof document !== 'undefined' && document.cookie.includes('dev_session=true');

  if (isDev && hasDevSession) {
    try {
      if (!API_BASE_URL) {
        throw new Error("API_BASE_URL is not defined");
      }
      let res = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        credentials: "include",
      });

      if (res.status === 401 || res.status >= 500) {
        return getMockResponse(url, options);
      }
      return res;
    } catch (err) {
      console.warn(`[DEV] Backend connection failed for ${url} — returning mock response.`);
      return getMockResponse(url, options);
    }
  }

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
    '/auth/verify-mfa',
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
  const compactPayload = compactOptionalFields(payload);
  const res = await apiFetch("/users/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(compactPayload),
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
  const res = await apiFetch('/auth/verify-mfa', {
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
  const res = await apiFetch('/auth/verify-mfa', {
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
