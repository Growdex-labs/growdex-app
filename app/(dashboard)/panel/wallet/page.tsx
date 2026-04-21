"use client";

import { DashboardHeader } from "../components/dashboard-header";
import { PanelLayout } from "../components/panel-layout";
import { useEffect, useState, useMemo } from "react";
import { useMe } from "@/context/me-context";
import { apiFetch } from "@/lib/auth";
import { Loader2, AlertCircle } from "lucide-react";
import { WalletSidebar } from "./components/wallet-sidebar";

interface PaymentUrl {
  platform: "meta" | "tiktok";
  billingUrl: string;
}

const PLATFORM_CONFIG = {
  meta: {
    name: "Meta",
    icon: (
      <img
        src="/logos_meta-icon.png"
        alt="meta"
        className="w-8 h-8 object-contain"
      />
    ),
    color: "from-blue-50 to-blue-100 border-blue-200",
  },
  tiktok: {
    name: "TikTok",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
    color: "from-black to-gray-800 border-gray-900",
  },
};

export default function PaymentPage() {
  const { me, isLoading: meLoading } = useMe();
  const [paymentUrls, setPaymentUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);

  // Get connected platforms
  const connectedPlatforms = useMemo(() => {
    if (!me?.platformConnections) return [];

    return me.platformConnections
      .map((connection: any) => connection.platform)
      .filter((p) => ["meta", "tiktok"].includes(p));
  }, [me?.platformConnections]);

  // Fetch payment URLs on mount
  useEffect(() => {
    let mounted = true;

    const fetchPaymentUrls = async () => {
      if (!connectedPlatforms.length) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        if (mounted) {
          setLoading(true);
          setError(null);
        }

        // TODO: Replace with actual endpoint from API
        const urlMap: Record<string, string> = {};

        // Fetch billing Info
        try {
          const res = await apiFetch("/users/ad-accounts/billing", {
            method: "GET",
          });

          if (res.ok) {
            const data = (await res.json()) as {
              platform: string;
              billingUrl: string;
            }[];
            console.log("Fetched billing URL:", data);

            data.forEach((item) => {
              urlMap[item.platform] = item.billingUrl;
            });
          }
        } catch (err) {
          console.error("Failed to fetch billing URL", err);
        }

        if (mounted) setPaymentUrls(urlMap);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load payment information";
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (!meLoading) {
      fetchPaymentUrls();
    }

    return () => {
      mounted = false;
    };
  }, [connectedPlatforms, meLoading]);

  const handlePaymentClick = (platform: string, billingUrl: string) => {
    if (!billingUrl) return;

    setLoadingPlatform(platform);

    const width = 700;
    const height = 800;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      billingUrl,
      `${platform}_payment`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      setLoadingPlatform(null);
      setError("Popup blocked. Please allow popups to proceed with payment.");
      return;
    }

    // Monitor popup for closure
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        setLoadingPlatform(null);
      }
    }, 500);
  };

  const hasConnectedPlatforms = connectedPlatforms.length > 0;

  return (
    <PanelLayout>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Secondary Sidebar */}
        <div className="hidden sm:block">
          <WalletSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Billings</h1>
            <p className="text-gray-600 mt-2">
              Manage your account status and billing information.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            {/* Dashboard Header - Hidden on mobile */}
            <div className="hidden sm:block mb-8">
              <DashboardHeader />
            </div>

            {/* Loading State */}
            {(meLoading || loading) && hasConnectedPlatforms === false ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-4" />
                <p className="text-gray-600">Loading billing options...</p>
              </div>
            ) : !hasConnectedPlatforms ? (
              /* Empty State - No Connected Platforms */
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  No Connected Platforms
                </h2>
                <p className="text-gray-600 text-center max-w-sm">
                  Connect your Meta or TikTok account to manage payments and
                  initiate transactions.
                </p>
              </div>
            ) : error ? (
              /* Error State */
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Error Loading Payments
                </h2>
                <p className="text-gray-600 text-center max-w-sm">{error}</p>
              </div>
            ) : (
              /* Payment Options */
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Available Payment Platforms
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {connectedPlatforms.map((platform) => {
                      const config =
                        PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
                      const paymentUrl = paymentUrls[platform];
                      const isLoading = loadingPlatform === platform;

                      if (!config) return null;

                      return (
                        <div
                          key={platform}
                          className={`bg-gradient-to-br ${config.color} border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg`}
                        >
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              {config.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {config.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Secure payment processing
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-700 text-sm mb-6">
                            Complete your payment securely through{" "}
                            {config.name}.
                          </p>

                          <button
                            onClick={() =>
                              paymentUrl && handlePaymentClick(platform, paymentUrl)
                            }
                            disabled={!paymentUrl || isLoading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                              !paymentUrl || isLoading
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 hover:shadow-lg hover:scale-105 active:scale-95"
                            }`}
                          >
                            {isLoading && (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            {isLoading
                              ? "Processing..."
                              : `Pay with ${config.name}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Information Box */}
                <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Secure Payment Processing
                  </h3>
                  <p className="text-sm text-gray-700">
                    All payments are processed securely through your selected ad platform. Your
                    payment information is encrypted and never stored on our servers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
