"use client";

import { ReactNode } from "react";
import { Loader2, Bell } from "lucide-react";
import { SocialPlatform } from "@/lib/oauth";
import { SocialAccountSetupProps } from "@/types/social";
import { StepHeading, PrimaryButton } from "./onboarding-layout";

interface StepConnectProps {
  socialAccounts: SocialAccountSetupProps;
  loadingAction: string | null;
  handleConnectSocial: (platform: SocialPlatform) => Promise<void>;
  onSkip: () => void;
  onComplete: () => void;
  isCompleting: boolean;
}

function PlatformLogo({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
      {children}
    </span>
  );
}

const LINKEDIN = (
  <svg viewBox="0 0 24 24" className="size-5 fill-[#0a66c2]">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
  </svg>
);

const X_LOGO = (
  <svg viewBox="0 0 24 24" className="size-5 fill-black">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);

const SNAPCHAT = (
  <svg viewBox="0 0 24 24" className="size-5 fill-[#000]">
    <path d="M12 2c2.7 0 4.6 2.2 4.6 4.9 0 .6 0 1.4-.1 2 .3.2.7.2 1 .1.6-.2 1.1.6.6 1.1-.4.4-1 .6-1.5.8-.2.6.5 1.6 1.4 2.3.6.5 1.4.8 2.2 1 .4.1.5.6.2.8-.8.6-1.9.6-2.6.9-.2.6-.1 1.3-.7 1.5-.6.2-1.4-.3-2.2-.2-.7.1-1.3.9-2.4 1.3-.3.1-.7.2-1.5.2s-1.2-.1-1.5-.2c-1.1-.4-1.7-1.2-2.4-1.3-.8-.1-1.6.4-2.2.2-.6-.2-.5-.9-.7-1.5-.7-.3-1.8-.3-2.6-.9-.3-.2-.2-.7.2-.8.8-.2 1.6-.5 2.2-1 .9-.7 1.6-1.7 1.4-2.3-.5-.2-1.1-.4-1.5-.8-.5-.5 0-1.3.6-1.1.3.1.7.1 1-.1-.1-.6-.1-1.4-.1-2C7.4 4.2 9.3 2 12 2Z" />
  </svg>
);

const CheckIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M5 10.5L8.5 14L15 6" stroke="#0A883F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function ActiveCard({
  title,
  description,
  logo,
  connected,
  accountName,
  loading,
  onConnect,
}: {
  title: string;
  description: string;
  logo: ReactNode;
  connected: boolean;
  accountName?: string;
  loading: boolean;
  onConnect: () => void;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#e3e5ec] bg-white p-4 shadow-sm">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <PlatformLogo>{logo}</PlatformLogo>
          {connected && accountName && (
            <span className="truncate text-sm font-medium text-[#333]">{accountName}</span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-[#333]">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#666]">{description}</p>
      </div>

      <div className="mt-4 flex justify-end">
        {connected ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#0A883F]">
            {CheckIcon}
            Connected
          </span>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm font-medium text-firebrick-500 transition-colors hover:underline disabled:opacity-50"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Connecting..." : "Connect"}
          </button>
        )}
      </div>
    </div>
  );
}

function ComingSoonCard({
  title,
  description,
  logo,
}: {
  title: string;
  description: string;
  logo: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#e3e5ec] bg-[#f5f6f8] p-4">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="opacity-60 grayscale">
            <PlatformLogo>{logo}</PlatformLogo>
          </span>
          <span className="rounded-md bg-[#eceef2] px-2 py-0.5 text-[10px] font-medium text-[#808080]">
            Coming Soon
          </span>
        </div>
        <h3 className="text-sm font-semibold text-[#808080]">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#9ca0b0]">{description}</p>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm text-[#808080] transition-colors hover:text-[#555]"
        >
          <Bell className="size-4" />
          Notify me
        </button>
      </div>
    </div>
  );
}

export function StepConnectOnboarding({
  socialAccounts,
  loadingAction,
  handleConnectSocial,
  onSkip,
  onComplete,
  isCompleting,
}: StepConnectProps) {
  return (
    <div>
      <StepHeading
        title="Connect your social accounts"
        subtitle="Don't worry, you're safe. We need to connect your accounts to enable you run unified ads across one dashboard."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ActiveCard
          title="Meta Ads"
          description="Connect Facebook and Instagram advertising data for cross-channel analysis."
          logo={<img src="/logos_meta-icon.png" alt="Meta" className="size-5 object-contain" />}
          connected={!!socialAccounts.meta?.connected}
          accountName={socialAccounts.meta?.assets?.[0]?.adAccountName}
          loading={loadingAction === "meta"}
          onConnect={() => handleConnectSocial("meta")}
        />
        <ActiveCard
          title="TikTok Ads"
          description="Sync TikTok for business metrics to optimize high-growth video creative performance."
          logo={<img src="/logos_tiktok-icon.png" alt="TikTok" className="size-5 object-contain" />}
          connected={!!socialAccounts.tiktok?.connected}
          accountName={socialAccounts.tiktok?.assets?.[0]?.name}
          loading={loadingAction === "tiktok"}
          onConnect={() => handleConnectSocial("tiktok")}
        />
        <ComingSoonCard
          title="LinkedIn Ads"
          description="Professional advertising insights for B2B marketers coming soon."
          logo={LINKEDIN}
        />
        <ComingSoonCard
          title="Google Ads"
          description="Search and display network metrics, currently in private beta."
          logo={<img src="/devicon_google.png" alt="Google" className="size-5 object-contain" />}
        />
        <ComingSoonCard
          title="X Marketing"
          description="Real-time performance tracking for X campaigns under development."
          logo={X_LOGO}
        />
        <ComingSoonCard
          title="Snapchat Ads"
          description="Engagement metrics for Snap and Lenses integration scheduled soon."
          logo={SNAPCHAT}
        />
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="text-sm">
          <span className="text-[#666]">Don&apos;t see your platform? </span>
          <button type="button" className="font-medium text-firebrick-500 hover:underline">
            Request a new integration
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSkip}
            disabled={isCompleting}
            className="text-sm text-[#808080] transition-colors hover:text-[#555] disabled:opacity-50"
          >
            Skip for now
          </button>
          <PrimaryButton onClick={onComplete} disabled={isCompleting}>
            {isCompleting ? "Finishing..." : "Complete Setup"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
