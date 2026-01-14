"use client";

import { Wifi } from "lucide-react";
import { hydrateSocialAccounts } from "@/lib/social";
import { SocialAccountSetupProps } from "@/types/social";
import { SocialPlatform } from "@/lib/oauth";
import { useEffect, useState } from "react";
import { MetaAssetSwitcherModal } from "@/components/platforms/asset-switcher-modal";
import { apiFetch } from "@/lib/auth";
import { ReconnectBanner } from "@/components/platforms/reconnect-banner";

interface StepTwoProps {
    mode: 'connect' | 'confirm';
    socialAccounts: SocialAccountSetupProps;
    loadingAction: string | null;
    handleConnectSocial: (platform: SocialPlatform) => Promise<void>;
    handleDisconnectSocial: (platform: SocialPlatform) => Promise<void>;
    onNext: () => void;
    onConfirm: () => void;
    handleSetupLater: () => void;
}

function Header() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl md:text-4xl"><Wifi className='text-blue-400'/></span>
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
          Connect your ad platforms
        </h1>
      </div>
      <p className="text-gray-700 max-w-2xl">
        Don't worry, you're safe. We need to connect your accounts to enable
        you run unified ads across one dashboard.
      </p>
    </div>
  );
}

function ConnectPlatformsView({
  socialAccounts,
  loadingAction,
  handleConnectSocial,
  handleDisconnectSocial,
  onNext,
  handleSetupLater
}: StepTwoProps) {
  return (
    <div>
      {/* Header */}
      <Header />

      <div className="space-y-4 mb-8">
        {/* Meta */}
        <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-white">
          <div>
            <h4 className="text-sm text-gray-500 mb-1">
              Connect your Meta account
            </h4>
            <img src="/logos_meta-icon.png" alt="meta" />
            <div className="font-medium text-gray-900">
              {socialAccounts.meta?.assets?.[0]?.adAccountName || ''}
            </div>
          </div>
          {socialAccounts.meta?.connected ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-green-600 font-medium">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Connected
              </span>
              <button
                onClick={() => handleDisconnectSocial('meta')}
                disabled={loadingAction !== null}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleConnectSocial('meta')}
              disabled={loadingAction !== null}
              className="flex items-center gap-2 text-red-600 font-medium hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {loadingAction === 'meta' ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>

        {/* TikTok */}
        <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-white">
          <div>
            <h4 className="text-sm text-gray-500 mb-1">
              Connect your Tiktok account
            </h4>
            <img src="/logos_tiktok-icon.png" alt="tiktok" />
            <div className="font-medium text-gray-900">
              {socialAccounts.tiktok?.assets?.[0]?.name || ''}
            </div>
          </div>
          {socialAccounts.tiktok?.connected ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-green-600 font-medium">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Connected
              </span>
              <button
                onClick={() => handleDisconnectSocial('tiktok')}
                disabled={loadingAction !== null}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleConnectSocial('tiktok')}
              disabled={loadingAction !== null}
              className="flex items-center gap-2 text-red-600 font-medium hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {loadingAction === 'tiktok' ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onNext}
          disabled={loadingAction !== null}
          className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg"
        >
          Continue
        </button>

        <button
          onClick={handleSetupLater}
          disabled={loadingAction !== null}
          className="text-gray-400 hover:text-gray-600"
        >
          Setup later
        </button>
      </div>
    </div>
  );
}

function ConfirmAssetsView({
  socialAccounts,
  onConfirm,
  loadingAction
}: StepTwoProps) {
  const [showMetaSwitcher, setShowMetaSwitcher] = useState(false);
  const [socialSetup, setSocialSetup] = useState<SocialAccountSetupProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrateSocialAccounts().then((res) => {
      if (res.success && res.data) {
        setSocialSetup(res.data);
      }
      setLoading(false);
    });
  }, []);
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold">
          Here's what we'll manage for you
        </h1>
        <p className="text-gray-600 mt-2">
          You can change this later at any time.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {socialAccounts.meta?.connected && (
          <div className="p-4 border rounded-lg bg-white">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Meta</h3>
              <button
                onClick={() => setShowMetaSwitcher(true)}
                className="text-sm text-blue-600"
              >
                Change
              </button>
            </div>

            {socialAccounts.meta?.assets
              ?.filter(a => a.isPrimary)
              .map(asset => (
                <div key={asset.adAccountId}>
                  <p className="text-sm">Ad Account: {asset.adAccountName}</p>
                  <p className="text-sm">Page: {asset.pageName}</p>
                </div>
            ))}
          </div>
        )}

        {showMetaSwitcher && (
          <MetaAssetSwitcherModal
            assets={socialAccounts.meta?.assets!}
            onSelect={async (id) => {
              await apiFetch('/users/onboarding/assets/meta/primary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetId: id })
              });

              setShowMetaSwitcher(false);
              await hydrateSocialAccounts().then(res => {
                if (res.success && res.data) {
                  setSocialSetup(res.data);
                }
              });
            }}
            onClose={() => setShowMetaSwitcher(false)}
          />
        )}
        {socialAccounts.meta?.needsReauth && (
          <ReconnectBanner
            platform="Meta"
            reconnectUrl="/auth/meta"
          />
        )}

        {socialAccounts.tiktok?.needsReauth && (
          <ReconnectBanner
            platform="TikTok"
            reconnectUrl="/auth/tiktok"
          />
        )}

        {socialAccounts.tiktok?.connected && (
          <div className="p-4 border rounded-lg bg-white">
            <h3 className="font-semibold">TikTok</h3>
            <p className="text-sm text-gray-600">
              Advertiser: {socialAccounts.tiktok?.assets?.[0]?.name}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onConfirm}
        disabled={loadingAction !== null}
        className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
      >
        Confirm & Continue
      </button>
    </div>
  );
}


export function StepTwoOnboarding(props: StepTwoProps) {
  return props.mode === 'confirm'
    ? <ConfirmAssetsView {...props} />
    : <ConnectPlatformsView {...props} />;
}
