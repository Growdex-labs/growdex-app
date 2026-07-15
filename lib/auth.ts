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

export interface ApiResponse<T = unknown> {
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

const isMockableDevUrl = (url: string) =>
  url === "/users/me" ||
  url === "/users/me/user" ||
  url === "/users/ad-accounts/billing" ||
  url === "/users/onboarding" ||
  url === "/users/onboarding/business" ||
  url === "/users/onboarding/goals" ||
  url === "/users/onboarding/complete" ||
  url === "/users/onboarding/status" ||
  url === "/notifications/history" ||
  url === "/media/signature-stamp" ||
  url === "/auth/mfa/status" ||
  url === "/auth/mfa/enable" ||
  url === "/auth/mfa/disable" ||
  url === "/auth/verify-mfa" ||
  url === "/campaigns" ||
  url === "/campaigns/metrics" ||
  url.startsWith("/campaigns/") ||
  url === "/audiences" ||
  url.startsWith("/audiences/");

const getMockResponse = (url: string, options?: RequestInit): Response => {
  let data: unknown = { success: true };
  let status = 200;
  const mockCampaigns = [
    {
      id: "fe8df890-0917-4cd0-9d41-fb2fd2fbfcc7",
      name: "Growdex Meta Traffic Test",
      goal: "TRAFFIC",
      platforms: ["meta"],
      targeting: {
        locations: ["NG"],
        ageMin: 18,
        ageMax: 65,
        gender: "all",
        interests: ["technology", "business"],
      },
      budget: {
        amount: 500000,
        currency: "NGN",
        type: "daily",
        startDate: "2026-06-09T08:00:00.000Z",
        endDate: "2026-06-16T08:00:00.000Z",
      },
      status: "scheduled",
      createdAt: "2026-06-09T08:00:00.000Z",
    },
    {
      id: "18f4520f-5424-450d-9e8f-35d9b8450c09",
      name: "Codex Test Campaign",
      goal: "AWARENESS",
      platforms: ["meta", "tiktok"],
      targeting: {
        locations: ["NG"],
        ageMin: 18,
        ageMax: 65,
        gender: "all",
        interests: ["marketing"],
      },
      budget: {
        amount: 500000,
        currency: "NGN",
        type: "daily",
        startDate: "2026-06-09T08:00:00.000Z",
        endDate: "2026-06-16T08:00:00.000Z",
      },
      status: "scheduled",
      createdAt: "2026-06-09T08:00:00.000Z",
    },
  ];
  const mockAudiences = [
    {
      id: "7a6d3fb4-d254-4f8a-b4c3-4dd2dd923733",
      name: "Growth audience",
      country: ["NG"],
      locations: ["Lagos"],
      interests: ["Technology"],
      platforms: ["meta", "tiktok"],
      metaConfig: { ageMin: 18, ageMax: 65, gender: "ALL" },
      tiktokConfig: {
        ageRanges: ["AGE_18_24", "AGE_25_34"],
        gender: "GENDER_UNLIMITED",
      },
    },
  ];

  if (url === "/users/me" && options?.method === "PATCH") {
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
      } catch {}
    }
  } else if (url === "/users/me") {
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
      } catch {}
    }
  } else if (url === "/users/onboarding") {
    if (options?.body && typeof window !== "undefined") {
      try {
        const bodyObj = JSON.parse(options.body as string);
        localStorage.setItem(
          "mock_profile",
          JSON.stringify({
            firstName: bodyObj.firstName,
            lastName: bodyObj.lastName,
            industry: bodyObj.industry,
            monthlyBudget: bodyObj.monthlyBudget,
          }),
        );
        localStorage.setItem(
          "mock_brand",
          JSON.stringify({
            name: bodyObj.organizationName,
            size: bodyObj.organizationSize ?? 0,
            industry: bodyObj.industry,
          }),
        );
      } catch {}
    }
    data = { success: true };
  } else if (url === "/users/onboarding/business") {
    if (options?.body && typeof window !== "undefined") {
      try {
        const bodyObj = JSON.parse(options.body as string);
        const currentBrand = localStorage.getItem("mock_brand")
          ? JSON.parse(localStorage.getItem("mock_brand")!)
          : {};
        localStorage.setItem(
          "mock_brand",
          JSON.stringify({
            ...currentBrand,
            businessName: bodyObj.businessName,
            website: bodyObj.website,
            advertisingBudget: bodyObj.advertisingBudget,
            industry: bodyObj.industry ?? currentBrand.industry,
            country: bodyObj.country,
          }),
        );
      } catch {}
    }
    data = { success: true };
  } else if (url === "/users/onboarding/goals") {
    if (options?.body && typeof window !== "undefined") {
      try {
        localStorage.setItem("mock_goals", options.body as string);
      } catch {}
    }
    data = { success: true };
  } else if (url === "/users/ad-accounts/billing") {
    data = [
      { platform: "meta", billingUrl: "https://www.facebook.com/ads/manager/billing" },
      { platform: "tiktok", billingUrl: "https://ads.tiktok.com/i18n/dashboard" }
    ];
  } else if (url === "/users/onboarding/status") {
    data = {
      meta: {
        connected: true,
        needsReauth: false,
        assets: [
          {
            adAccountId: "mock-meta-123",
            adAccountName: "Growdex Meta Ads",
            pageName: "Growdex",
            instagram: "growdex",
            isPrimary: true,
          },
        ],
      },
      tiktok: {
        connected: true,
        needsReauth: false,
        assets: [
          {
            advertiserId: "mock-tiktok-456",
            name: "Growdex TikTok Ads",
            isPrimary: true,
          },
        ],
      },
    };
  } else if (url === "/notifications/history") {
    data = {
      notifications: [
        {
          id: "mock-notification-1",
          content: { title: "Campaign ready", message: "Your campaign draft is ready to review." },
          timestamp: "2026-06-10T08:00:00.000Z",
          isRead: false,
        },
      ],
    };
  } else if (url === "/auth/mfa/status") {
    data = { status: false };
  } else if (url === "/auth/mfa/enable") {
    data = {
      status: "MFA_SETUP_REQUIRED",
      uri: "otpauth://totp/Growdex:devtest@growdex.io?secret=JBSWY3DPEHPK3PXP&issuer=Growdex",
      secret: "JBSWY3DPEHPK3PXP",
    };
  } else if (url === "/auth/mfa/disable" || url === "/auth/verify-mfa") {
    data = { success: true, status: true };
  } else if (url === "/campaigns" && options?.method === "POST") {
    data = {
      ...mockCampaigns[0],
      id: "3e8d9f6a-820e-4cc8-a6d0-9729ff9d9fb8",
      status: "scheduled",
    };
  } else if (url === "/campaigns") {
    data = mockCampaigns;
  } else if (url === "/campaigns/metrics") {
    data = {
      summary: {
        totalSpend: 0,
        activeCount: 0,
        suspendedCount: 0,
        scheduledCount: mockCampaigns.length,
        completedCount: 0,
      },
      campaigns: mockCampaigns,
    };
  } else if (url.startsWith("/campaigns/") && url.endsWith("/publish")) {
    data = { success: true, status: "publishing" };
  } else if (url.startsWith("/campaigns/")) {
    const id = decodeURIComponent(url.replace("/campaigns/", ""));
    const campaign = mockCampaigns.find((item) => item.id === id);
    if (campaign) {
      data = campaign;
    } else {
      status = 404;
      data = { message: "Campaign not found" };
    }
  } else if (url === "/audiences" && options?.method === "POST") {
    try {
      const body = options.body ? JSON.parse(options.body as string) : {};
      data = {
        ...mockAudiences[0],
        ...body,
        id: "a6a70d27-428a-4b7e-877b-b5429f13f0e19",
      };
    } catch {
      data = mockAudiences[0];
    }
  } else if (url === "/audiences") {
    data = mockAudiences;
  } else if (url.startsWith("/audiences/")) {
    const id = decodeURIComponent(url.replace("/audiences/", ""));
    const audience = mockAudiences.find((item) => item.id === id);
    if (audience) {
      data = audience;
    } else {
      status = 404;
      data = { message: "Audience not found" };
    }
  } else if (url === "/media/signature-stamp") {
    data = {
      signature: "mock_signature",
      timestamp: Math.floor(Date.now() / 1000),
      api_key: "mock_api_key",
    };
  }

  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

export const clearDevSession = (): void => {
  if (typeof document === 'undefined') return;
  const expire = 'Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `dev_session=; path=/; expires=${expire}`;
  document.cookie = `access_token=; path=/; expires=${expire}`;
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
    if (isMockableDevUrl(url)) {
      return getMockResponse(url, options);
    }

    try {
      if (!API_BASE_URL) {
        throw new Error("API_BASE_URL is not defined");
      }
      const res = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        credentials: "include",
      });

      if ((res.status === 401 || res.status >= 500) && isMockableDevUrl(url)) {
        return getMockResponse(url, options);
      }
      return res;
    } catch (err) {
      return new Response(
        JSON.stringify({
          message:
            err instanceof Error
              ? err.message
              : `Backend connection failed for ${url}`,
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
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
  clearDevSession();
  const res = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // MFA is optional: the backend still challenges users who have 2FA enabled,
    // but users who never opted in are not forced through setup.
    body: JSON.stringify({ email, password }),
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
  clearDevSession();
  const res = await apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
};

/**
 * Resend the email-verification message for an unverified account.
 */
export const resendVerification = async (email: string) => {
  const res = await apiFetch("/auth/resend-verification", {
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
  clearDevSession();
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
