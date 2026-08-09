"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { AlertCircle, Check, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PanelLayout } from "../components/panel-layout";
import { MetaIcon, TikTokIcon } from "../components/platform-icons";
import { hydrateSocialAccounts } from "@/lib/social";
import { connectSocialAccount, disconnectSocialAccount } from "@/lib/oauth";
import type { SocialPlatform } from "@/lib/oauth";
import type { SocialAccountSetupProps } from "@/types/social";

const PLATFORMS: Array<{
  id: SocialPlatform;
  name: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
}> = [
  {
    id: "meta",
    name: "Meta",
    description:
      "Publish to Facebook and Instagram, and read performance back into Growdex.",
    Icon: MetaIcon,
  },
  {
    id: "tiktok",
    name: "TikTok",
    description:
      "Publish TikTok campaigns and read performance back into Growdex.",
    Icon: TikTokIcon,
  },
];

const assetNames = (
  accounts: SocialAccountSetupProps | null,
  platform: SocialPlatform,
): string[] => {
  if (platform === "meta") {
    return (accounts?.meta?.assets ?? []).map((asset) => asset.adAccountName);
  }
  return (accounts?.tiktok?.assets ?? []).map((asset) => asset.name);
};

export default function IntegrationsPage() {
  const [accounts, setAccounts] = useState<SocialAccountSetupProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyPlatform, setBusyPlatform] = useState<SocialPlatform | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await hydrateSocialAccounts();
      if (result.success && result.data) {
        setAccounts(result.data);
      } else {
        setError(result.error ?? "Could not load your connected platforms.");
      }
    } catch {
      setError("Could not load your connected platforms.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const connect = async (platform: SocialPlatform, name: string) => {
    setBusyPlatform(platform);
    try {
      const result = await connectSocialAccount(platform);
      if (!result.success) {
        toast.error(result.error ?? `Could not connect ${name}.`);
        return;
      }
      toast.success(`Connected to ${name}`);
      if (result.data) {
        setAccounts(result.data);
        setError(null);
      } else {
        await load();
      }
    } finally {
      setBusyPlatform(null);
    }
  };

  const disconnect = async (platform: SocialPlatform, name: string) => {
    setBusyPlatform(platform);
    try {
      const result = await disconnectSocialAccount(platform);
      if (!result.success) {
        toast.error(result.error ?? `Could not disconnect ${name}.`);
        return;
      }
      toast.success(`Disconnected from ${name}`);
      await load();
    } finally {
      setBusyPlatform(null);
    }
  };

  return (
    <PanelLayout>
      <div className="min-h-full bg-[#f5f5f5] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-5">
          <header>
            <p className="text-sm text-dimGray">Integrations</p>
            <h1 className="mt-1 text-2xl font-gilroy-bold text-gray-950">
              Advertising platforms
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Connect Meta and TikTok so Growdex can create, publish, and
              measure campaigns for you.
            </p>
          </header>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-gilroy-semibold">Platforms unavailable</p>
                <p className="mt-1">{error}</p>
                <button
                  type="button"
                  onClick={() => void load()}
                  className="mt-3 text-xs font-gilroy-semibold underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-gray-200 bg-white">
              <Loader2 className="size-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {PLATFORMS.map(({ id, name, description, Icon }) => {
                const platform = accounts?.[id];
                const connected = Boolean(platform?.connected);
                const needsReauth = Boolean(platform?.needsReauth);
                const names = assetNames(accounts, id);
                const busy = busyPlatform === id;

                return (
                  <section
                    key={id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-4">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                          <Icon className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-gilroy-semibold text-gray-950">
                              {name}
                            </h2>
                            {connected ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-gilroy-semibold text-emerald-700">
                                <Check className="size-3" /> Connected
                              </span>
                            ) : (
                              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-gilroy-semibold text-gray-500">
                                Not connected
                              </span>
                            )}
                            {needsReauth && (
                              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-gilroy-semibold text-amber-700">
                                Reconnect needed
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm leading-6 text-gray-500">
                            {description}
                          </p>
                          {names.length > 0 && (
                            <p className="mt-2 truncate text-xs text-dimGray">
                              Ad accounts: {names.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {connected && !needsReauth ? (
                          <button
                            type="button"
                            onClick={() => void disconnect(id, name)}
                            disabled={busy}
                            className="rounded-lg px-4 py-2.5 text-sm font-gilroy-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            {busy ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              "Disconnect"
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void connect(id, name)}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-gilroy-semibold text-gray-950 transition-colors hover:bg-khaki-300 disabled:opacity-60"
                          >
                            {busy ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : needsReauth ? (
                              <RefreshCw className="size-4" />
                            ) : null}
                            {needsReauth ? "Reconnect" : `Connect ${name}`}
                          </button>
                        )}
                      </div>
                    </div>

                    {connected && (
                      <div className="mt-5 border-t border-gray-100 pt-4">
                        <Link
                          href={`/panel/billing?tab=ad-accounts`}
                          className="text-xs font-gilroy-semibold text-peru-200 hover:underline"
                        >
                          Manage {name} funding
                        </Link>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PanelLayout>
  );
}
