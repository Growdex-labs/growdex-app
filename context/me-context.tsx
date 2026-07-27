"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/auth";

export type MeProfile = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  country: string | null;
};

export type MeBrand = {
  id: string;
  name: string;
  businessAddress: string | null;
  size: number | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  googleUrl: string | null;
  createdAt: string;
};

export type PlatformConnection = {
  platform: string;
  accountName?: string;
  accountId?: string;
  status?: string;
  [key: string]: unknown; // allow extra fields from the API without breaking
};

export type MeResponse = {
  email: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  isAdmin: boolean;
  profile: MeProfile;
  brand: MeBrand;
  platformConnections: PlatformConnection[];
};

type MeContextValue = {
  me: MeResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const MeContext = createContext<MeContextValue | undefined>(undefined);


const MOCK_ME: MeResponse = {
  email: "devtest@growdex.io",
  avatarUrl: null,
  onboardingCompleted: true,
  isAdmin: true,
  profile: {
    id: "mock-id",
    firstName: "Dev",
    lastName: "Tester",
    phone: null,
    country: null,
  },
  brand: {
    id: "mock-brand-id",
    name: "Growdex Dev Brand",
    businessAddress: null,
    size: null,
    instagramUrl: null,
    facebookUrl: null,
    twitterUrl: null,
    googleUrl: null,
    createdAt: new Date().toISOString(),
  },
  platformConnections: [
    { platform: "meta", accountName: "Growdex Meta Ads", accountId: "mock-meta-123", status: "active" },
    { platform: "tiktok", accountName: "Growdex TikTok Ads", accountId: "mock-tiktok-456", status: "active" },
  ],
};

const AUTH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/mfa",
];

const shouldSkipMeFetch = (pathname: string | null) => {
  if (!pathname) return false;
  return AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
};

export function MeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inFlightRef = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return inFlightRef.current;

    const run = (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiFetch("/users/me", { method: "GET" });
        if (!res.ok) { setMe(null); return; }
        const json = (await res.json()) as MeResponse;
        setMe(json);
      } catch (err) {
        if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
          console.warn('[DEV] Backend unreachable — injecting MOCK_ME');
          setMe(MOCK_ME);
        } else {
          setMe(null);
          setError(err instanceof Error ? err.message : 'Failed to load user');
        }
      } finally {

        setIsLoading(false);
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = run;
    return run;
  }, []);

  useEffect(() => {
    if (shouldSkipMeFetch(pathname)) {
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      await refresh();
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, refresh]);

  const value = useMemo<MeContextValue>(
    () => ({ me, isLoading, error, refresh }),
    [me, isLoading, error, refresh],
  );

  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}

export function useMe() {
  const ctx = useContext(MeContext);
  if (!ctx) {
    throw new Error("useMe must be used within a MeProvider");
  }
  return ctx;
}
