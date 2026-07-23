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

export class AuthRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AuthRequestError";
  }
}

const readAuthError = async (response: Response): Promise<AuthRequestError> => {
  let details: Record<string, unknown> | undefined;

  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      details = body as Record<string, unknown>;
    }
  } catch {
    // An empty or non-JSON error response still has useful HTTP status context.
  }

  const serverMessage = details?.message;
  const message =
    typeof serverMessage === "string" && serverMessage.trim()
      ? serverMessage
      : `Request failed with status ${response.status}`;

  return new AuthRequestError(message, response.status, details);
};

export const getAuthErrorMessage = (
  error: unknown,
  serviceFailureMessage: string,
): string => {
  if (error instanceof AuthRequestError) {
    if (error.status >= 500) return serviceFailureMessage;

    const responseMessage = error.details?.message;
    const validationDetails =
      responseMessage &&
      typeof responseMessage === "object" &&
      !Array.isArray(responseMessage)
        ? (responseMessage as Record<string, unknown>)
        : error.details;
    const formErrors = validationDetails?.formErrors;
    if (Array.isArray(formErrors)) {
      const firstError = formErrors.find(
        (entry): entry is string => typeof entry === "string" && !!entry.trim(),
      );
      if (firstError) return firstError;
    }

    return error.message;
  }

  return serviceFailureMessage;
};

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
  url === "/wallet" ||
  url === "/users/onboarding" ||
  url === "/users/onboarding/status" ||
  url === "/users/onboarding/business" ||
  url === "/users/onboarding/goals" ||
  url === "/users/onboarding/complete" ||
  url === "/notifications/history" ||
  url === "/auth/mfa/status" ||
  url === "/auth/mfa/enable" ||
  url === "/auth/mfa/disable" ||
  url === "/auth/verify-mfa" ||
  url === "/audiences" ||
  url.startsWith("/audiences/");

const getMockResponse = (url: string, options?: RequestInit): Response => {
  let data: unknown = { success: true };
  let status = 200;
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
      isAdmin: true,
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
      {
        platform: "meta",
        accountId: "1234567890",
        accountName: "Growdex Meta Account",
        currency: "NGN",
        billingUrl: "https://www.facebook.com/ads/manager/billing",
      },
      {
        platform: "tiktok",
        accountId: "9876543210",
        accountName: "Growdex TikTok Account",
        currency: "NGN",
        billingUrl: "https://ads.tiktok.com/i18n/dashboard",
      },
    ];
  } else if (url === "/wallet") {
    data = {
      balances: { NGN: 30000000, USD: 18542.71 },
      adAccounts: [
        { platform: "meta", balance: 15900000, currency: "NGN" },
        { platform: "tiktok", balance: 14100000, currency: "NGN" },
      ],
      spending: [
        { label: "Feb", meta: 2300000, tiktok: 3100000 },
        { label: "Mar", meta: 1700000, tiktok: 2200000 },
        { label: "Apr", meta: 2800000, tiktok: 3600000 },
        { label: "May", meta: 2500000, tiktok: 4100000 },
        { label: "Jun", meta: 3600000, tiktok: 5400000 },
      ],
      spendChangePercent: 42,
      transactions: [
        { id: "GDX-ONE-UP-01", date: "2026-06-28", type: "deposit", amount: 1690000, currency: "NGN", status: "failed", merchant: "Paystack" },
        { id: "GDX-ONE-UP-02", date: "2026-06-28", type: "deposit", amount: 56789, currency: "NGN", status: "success", merchant: "Paystack" },
        { id: "GDX-CAMPAIGN-03", date: "2026-06-27", type: "campaign_spend", amount: 230000, currency: "NGN", status: "pending", merchant: "Meta Ads" },
      ],
    };
  } else if (url === "/users/onboarding/status") {
    data = {
      meta: {
        connected: true,
        needsReauth: false,
        assets: [
          {
            id: "mock-meta-123",
            adAccountId: "mock-meta-123",
            adAccountName: "Growdex Meta Ads",
            currency: "NGN",
            accountStatus: 1,
            timezoneName: "Africa/Lagos",
            minDailyBudgetMinor: 600000,
            pageId: "mock-page-123",
            pageName: "Growdex",
            instagramActorId: "mock-instagram-123",
            instagramUsername: "growdex",
            readyForCampaigns: true,
            isPrimary: true,
          },
        ],
      },
      tiktok: {
        connected: true,
        needsReauth: false,
        assets: [
          {
            id: "mock-tiktok-456",
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

export const isDevelopmentMockSessionActive = () =>
  process.env.NEXT_PUBLIC_APP_ENV === "development" &&
  typeof document !== "undefined" &&
  document.cookie.includes("dev_session=true");

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
    throw await readAuthError(res);
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
    throw await readAuthError(res);
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
    throw await readAuthError(res);
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
  try {
    await apiFetch("/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
  } finally {
    clearDevSession();
    window.location.href = "/login";
  }
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
