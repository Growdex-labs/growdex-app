"use client";

import { PanelLayout } from "../components/panel-layout";
import { useEffect, useState, useMemo } from "react";
import { useMe } from "@/context/me-context";
import { apiFetch } from "@/lib/auth";
import { Loader2, AlertCircle, Wallet } from "lucide-react";
import { WalletSidebar } from "./components/wallet-sidebar";

/* ─── Types ────────────────────────────────────────────────────────────────── */
type Platform = "meta" | "tiktok";

interface PlatformCfg {
  name: string;
  label: string;
  logo: React.ReactNode;
  avatarBg: string;
}

/* ─── Platform Config ─────────────────────────────────────────────────────── */
const META_LOGO = (
  <img
    src="/logos_meta-icon.png"
    alt="Meta"
    className="w-20 h-20 object-contain"
  />
);

const TIKTOK_LOGO = (
  <img
    src="/logos_tiktok-icon.png"
    alt="TikTok"
    className="w-20 h-20 object-contain"
  />
);


const PLATFORM_CONFIG: Record<Platform, PlatformCfg> = {
  meta: {
    name: "Meta",
    label: "Fund your Meta Ad Account",
    logo: META_LOGO,
    avatarBg: "bg-blue-600",
  },
  tiktok: {
    name: "TikTok",
    label: "Fund your TikTok Ad account",
    logo: TIKTOK_LOGO,
    avatarBg: "bg-gray-900",
  },
};

/* ─── Sub-components ───────────────────────────────────────────────────────── */
function AccountAvatar({ bg }: { bg: string }) {
  return (
    <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden>
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    </div>
  );
}

function PlatformCard({
  platform,
  isLoadingFund,
  onFund,
  accountName,
}: {
  platform: Platform;
  isLoadingFund: boolean;
  onFund: () => void;
  accountName: string;
}) {
  const cfg = PLATFORM_CONFIG[platform];

  return (
    <div className="flex flex-col">
      <p className="text-xs text-gray-400 mb-2">{cfg.label}</p>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
        {/* header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <AccountAvatar bg={cfg.avatarBg} />
          <span className="text-sm font-semibold text-gray-800">{accountName}</span>
        </div>

        {/* logo area */}
        <div className="flex items-center justify-center bg-gray-50 py-10 min-h-[190px]">
          {cfg.logo}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <button
            type="button"
            className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            Switch account
          </button>

          <button
            type="button"
            onClick={onFund}
            disabled={isLoadingFund}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#D6C34A] hover:bg-yellow-400 text-gray-900 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoadingFund ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wallet className="w-3.5 h-3.5" />
            )}
            {isLoadingFund ? "Opening..." : "Fund account"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export default function WalletPage() {
  const { me, isLoading: meLoading } = useMe();
  const [paymentUrls, setPaymentUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);

  /* Derive connected platforms from me context */
  const connectedPlatforms = useMemo<Platform[]>(() => {
    if (!me?.platformConnections) return [];
    return me.platformConnections
      .map((c) => c.platform)
      .filter((p): p is Platform => p === "meta" || p === "tiktok");
  }, [me?.platformConnections]);

  /* Fetch billing URLs once platforms are known */
  useEffect(() => {
    let mounted = true;

    async function fetchBilling() {
      if (!connectedPlatforms.length) {
        if (mounted) setLoading(false);
        return;
      }

      if (mounted) { setLoading(true); setError(null); }

      try {
        const res = await apiFetch("/users/ad-accounts/billing", { method: "GET" });
        if (res.ok) {
          const data: { platform: string; billingUrl: string }[] = await res.json();
          const map: Record<string, string> = {};
          data.forEach(({ platform, billingUrl }) => { map[platform] = billingUrl; });
          if (mounted) setPaymentUrls(map);
        }
      } catch (err) {
        console.error("Failed to fetch billing URLs on mount", err);
        // In production we show the error; in development we allow rendering cards normally
        if (process.env.NEXT_PUBLIC_APP_ENV !== 'development') {
          if (mounted) setError("Failed to load billing information.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!meLoading) fetchBilling();
    return () => { mounted = false; };
  }, [connectedPlatforms, meLoading]);

  /* Open payment URL in a popup window */
  async function handleFund(platform: string) {
    setLoadingPlatform(platform);
    setError(null);
    try {
      let billingUrl = paymentUrls[platform];

      // Always hit the billing endpoint first to fetch/refresh the link
      const res = await apiFetch("/users/ad-accounts/billing", { method: "GET" });
      if (res.ok) {
        const data: { platform: string; billingUrl: string }[] = await res.json();
        const found = data.find((item) => item.platform === platform);
        if (found?.billingUrl) {
          billingUrl = found.billingUrl;
          setPaymentUrls((prev) => ({ ...prev, [platform]: billingUrl }));
        }
      }

      // Development fallback if connection doesn't exist on the backend
      if (!billingUrl && process.env.NEXT_PUBLIC_APP_ENV === 'development') {
        console.warn(`[DEV] No billing URL found for ${platform} — using local fallback`);
        billingUrl = platform === 'meta'
          ? 'https://www.facebook.com/ads/manager/billing'
          : 'https://ads.tiktok.com/i18n/dashboard';
      }

      if (!billingUrl) {
        setError(`Could not retrieve billing link for ${platform === 'meta' ? 'Meta' : 'TikTok'}.`);
        setLoadingPlatform(null);
        return;
      }

      const w = 700, h = 800;
      const left = window.screenX + (window.outerWidth - w) / 2;
      const top = window.screenY + (window.outerHeight - h) / 2;
      const popup = window.open(
        billingUrl,
        `${platform}_payment`,
        `width=${w},height=${h},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`,
      );
      if (!popup) {
        setError("Popup blocked. Please allow popups for this site.");
        setLoadingPlatform(null);
        return;
      }
      const timer = setInterval(() => {
        if (popup.closed) { clearInterval(timer); setLoadingPlatform(null); }
      }, 500);
    } catch (err) {
      console.error(`Failed to load billing URL for ${platform}`, err);
      
      // Development fallback on error/network failure
      if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
        const fallbackUrl = platform === 'meta'
          ? 'https://www.facebook.com/ads/manager/billing'
          : 'https://ads.tiktok.com/i18n/dashboard';
        const w = 700, h = 800;
        const left = window.screenX + (window.outerWidth - w) / 2;
        const top = window.screenY + (window.outerHeight - h) / 2;
        const popup = window.open(
          fallbackUrl,
          `${platform}_payment`,
          `width=${w},height=${h},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`,
        );
        if (popup) {
          const timer = setInterval(() => {
            if (popup.closed) { clearInterval(timer); setLoadingPlatform(null); }
          }, 500);
          return;
        }
      }
      setError(`Failed to retrieve billing link for ${platform === 'meta' ? 'Meta' : 'TikTok'}.`);
      setLoadingPlatform(null);
    }
  }

  function getAccountName(platform: string) {
    const conn = me?.platformConnections?.find((c) => c.platform === platform);
    return conn?.accountName ?? "Growdex Ad Account";
  }

  const isPageLoading = meLoading || (loading && process.env.NEXT_PUBLIC_APP_ENV !== 'development');
  const hasConnected = connectedPlatforms.length > 0;

  return (
    <PanelLayout>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Wallet sidebar */}
        <div className="hidden sm:block">
          <WalletSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-6 sm:p-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Fund your ad wallet</h1>

          {isPageLoading && !hasConnected ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-10 h-10 text-gray-300 animate-spin" />
              <p className="text-sm text-gray-400">Loading billing options...</p>
            </div>

          ) : !hasConnected ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">No connected platforms</h2>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Connect your Meta or TikTok account in settings to manage payments.
              </p>
            </div>

          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Error loading payments</h2>
              <p className="text-sm text-gray-500 text-center max-w-xs">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs text-blue-600 underline font-medium"
              >
                Go back to billing cards
              </button>
            </div>

          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              {connectedPlatforms.map((platform) => (
                <PlatformCard
                  key={platform}
                  platform={platform}
                  isLoadingFund={loadingPlatform === platform}
                  accountName={getAccountName(platform)}
                  onFund={() => {
                    handleFund(platform);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PanelLayout>
  );
}
