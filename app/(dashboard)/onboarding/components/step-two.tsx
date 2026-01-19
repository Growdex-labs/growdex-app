"use client";

import { Loader2, Wifi } from "lucide-react";
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
  const [platformBoxSelected, setPlatformBoxSelected] = useState<SocialPlatform | null>(null);
  return (
    <div>
      {/* Header */}
      <Header />

      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Meta */}
        <div className={`h-[200px] md:h-[419px] flex flex-col justify-between p-4 border drop-shadow-lg ${platformBoxSelected === 'meta' ? 'border-khaki-200 drop-shadow-amber-200' : ''} rounded-lg bg-white`} onClick={() => setPlatformBoxSelected('meta')}>
          <div>
            <h4 className="text-sm text-gray-500 mb-1">
              {socialAccounts.meta?.connected
                ? socialAccounts.meta?.assets?.[0]?.adAccountName || ''
                : 'Connect your Meta account'
              }
            </h4>
            <div className="flex items-center justify-center h-[100px] md:h-[300px]">
              <img src="/logos_meta-icon-h100px.png" alt="meta" />
            </div>
          </div>
          {socialAccounts.meta?.connected ? (
            <div className="flex justify-end gap-3">
              <span className="flex items-center gap-2 text-green-600 font-medium">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.4749 2.85005C18.6405 2.67233 18.7307 2.43728 18.7264 2.1944C18.7221 1.95152 18.6237 1.71979 18.452 1.54802C18.2802 1.37626 18.0485 1.27787 17.8056 1.27358C17.5627 1.2693 17.3277 1.35945 17.1499 1.52505L15.1287 3.54505C14.1666 2.80117 12.9663 2.43347 11.7526 2.51077C10.5389 2.58808 9.39493 3.10511 8.53495 3.96505L6.91245 5.58755L6.59995 5.27505C6.42223 5.10945 6.18717 5.0193 5.94429 5.02358C5.70142 5.02787 5.46969 5.12626 5.29792 5.29802C5.12615 5.46979 5.02776 5.70152 5.02348 5.9444C5.01919 6.18728 5.10935 6.42233 5.27495 6.60005L5.58745 6.91255L3.95995 8.54005C3.1 9.40003 2.58298 10.544 2.50567 11.7577C2.42836 12.9714 2.79607 14.1717 3.53995 15.1338L1.52495 17.1501C1.43284 17.2359 1.35896 17.3394 1.30772 17.4544C1.25648 17.5694 1.22893 17.6935 1.22671 17.8194C1.22449 17.9453 1.24764 18.0703 1.29479 18.187C1.34195 18.3038 1.41213 18.4098 1.50115 18.4988C1.59017 18.5879 1.69622 18.6581 1.81295 18.7052C1.92969 18.7524 2.05472 18.7755 2.1806 18.7733C2.30648 18.7711 2.43062 18.7435 2.54562 18.6923C2.66062 18.641 2.76412 18.5672 2.84995 18.4751L4.8662 16.4601C5.82834 17.2039 7.02862 17.5716 8.24233 17.4943C9.45604 17.417 10.6 16.9 11.4599 16.0401L13.0874 14.4126L13.3999 14.7251C13.4858 14.8172 13.5893 14.891 13.7043 14.9423C13.8193 14.9935 13.9434 15.0211 14.0693 15.0233C14.1952 15.0255 14.3202 15.0024 14.4369 14.9552C14.5537 14.9081 14.6597 14.8379 14.7487 14.7488C14.8378 14.6598 14.908 14.5538 14.9551 14.437C15.0023 14.3203 15.0254 14.1953 15.0232 14.0694C15.021 13.9435 14.9934 13.8194 14.9422 13.7044C14.8909 13.5894 14.8171 13.4859 14.7249 13.4001L14.4124 13.0876L16.0349 11.4651C16.8949 10.6051 17.4119 9.46115 17.4892 8.24743C17.5665 7.03372 17.1988 5.83344 16.4549 4.8713L18.4749 2.85005ZM13.0874 11.7626L14.7087 10.1413C14.999 9.85111 15.2292 9.50657 15.3863 9.12738C15.5434 8.74818 15.6243 8.34175 15.6243 7.9313C15.6243 7.52085 15.5434 7.11442 15.3863 6.73523C15.2292 6.35603 14.999 6.0115 14.7087 5.7213L14.2799 5.29255C13.9898 5.00228 13.6452 4.77202 13.266 4.61492C12.8868 4.45783 12.4804 4.37697 12.0699 4.37697C11.6595 4.37697 11.2531 4.45783 10.8739 4.61492C10.4947 4.77202 10.1501 5.00228 9.85995 5.29255L8.2387 6.91255L13.0874 11.7626ZM6.91245 8.2388L5.28745 9.86505C4.99718 10.1552 4.76692 10.4998 4.60982 10.879C4.45272 11.2582 4.37187 11.6646 4.37187 12.0751C4.37187 12.4855 4.45272 12.8919 4.60982 13.2711C4.76692 13.6503 4.99718 13.9949 5.28745 14.2851L5.7162 14.7138C6.00639 15.0041 6.35093 15.2343 6.73012 15.3914C7.10932 15.5485 7.51575 15.6294 7.9262 15.6294C8.33665 15.6294 8.74308 15.5485 9.12227 15.3914C9.50147 15.2343 9.846 15.0041 10.1362 14.7138L11.7624 13.0876L6.91245 8.2388Z" fill="#0A883F"/>
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
            <div className="flex justify-end gap-3">
              <button
                  onClick={() => handleConnectSocial('meta')}
                  disabled={loadingAction !== null}
                  className="flex items-center gap-2 text-red-600 font-medium hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loadingAction === 'meta'
                    ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M18.4749 2.85005C18.6405 2.67233 18.7307 2.43728 18.7264 2.1944C18.7221 1.95152 18.6237 1.71979 18.452 1.54802C18.2802 1.37626 18.0485 1.27787 17.8056 1.27358C17.5627 1.2693 17.3277 1.35945 17.1499 1.52505L15.1287 3.54505C14.1666 2.80117 12.9663 2.43347 11.7526 2.51077C10.5389 2.58808 9.39493 3.10511 8.53495 3.96505L6.91245 5.58755L6.59995 5.27505C6.42223 5.10945 6.18717 5.0193 5.94429 5.02358C5.70142 5.02787 5.46969 5.12626 5.29792 5.29802C5.12615 5.46979 5.02776 5.70152 5.02348 5.9444C5.01919 6.18728 5.10935 6.42233 5.27495 6.60005L5.58745 6.91255L3.95995 8.54005C3.1 9.40003 2.58298 10.544 2.50567 11.7577C2.42836 12.9714 2.79607 14.1717 3.53995 15.1338L1.52495 17.1501C1.43284 17.2359 1.35896 17.3394 1.30772 17.4544C1.25648 17.5694 1.22893 17.6935 1.22671 17.8194C1.22449 17.9453 1.24764 18.0703 1.29479 18.187C1.34195 18.3038 1.41213 18.4098 1.50115 18.4988C1.59017 18.5879 1.69622 18.6581 1.81295 18.7052C1.92969 18.7524 2.05472 18.7755 2.1806 18.7733C2.30648 18.7711 2.43062 18.7435 2.54562 18.6923C2.66062 18.641 2.76412 18.5672 2.84995 18.4751L4.8662 16.4601C5.82834 17.2039 7.02862 17.5716 8.24233 17.4943C9.45604 17.417 10.6 16.9 11.4599 16.0401L13.0874 14.4126L13.3999 14.7251C13.4858 14.8172 13.5893 14.891 13.7043 14.9423C13.8193 14.9935 13.9434 15.0211 14.0693 15.0233C14.1952 15.0255 14.3202 15.0024 14.4369 14.9552C14.5537 14.9081 14.6597 14.8379 14.7487 14.7488C14.8378 14.6598 14.908 14.5538 14.9551 14.437C15.0023 14.3203 15.0254 14.1953 15.0232 14.0694C15.021 13.9435 14.9934 13.8194 14.9422 13.7044C14.8909 13.5894 14.8171 13.4859 14.7249 13.4001L14.4124 13.0876L16.0349 11.4651C16.8949 10.6051 17.4119 9.46115 17.4892 8.24743C17.5665 7.03372 17.1988 5.83344 16.4549 4.8713L18.4749 2.85005ZM13.0874 11.7626L14.7087 10.1413C14.999 9.85111 15.2292 9.50657 15.3863 9.12738C15.5434 8.74818 15.6243 8.34175 15.6243 7.9313C15.6243 7.52085 15.5434 7.11442 15.3863 6.73523C15.2292 6.35603 14.999 6.0115 14.7087 5.7213L14.2799 5.29255C13.9898 5.00228 13.6452 4.77202 13.266 4.61492C12.8868 4.45783 12.4804 4.37697 12.0699 4.37697C11.6595 4.37697 11.2531 4.45783 10.8739 4.61492C10.4947 4.77202 10.1501 5.00228 9.85995 5.29255L8.2387 6.91255L13.0874 11.7626ZM6.91245 8.2388L5.28745 9.86505C4.99718 10.1552 4.76692 10.4998 4.60982 10.879C4.45272 11.2582 4.37187 11.6646 4.37187 12.0751C4.37187 12.4855 4.45272 12.8919 4.60982 13.2711C4.76692 13.6503 4.99718 13.9949 5.28745 14.2851L5.7162 14.7138C6.00639 15.0041 6.35093 15.2343 6.73012 15.3914C7.10932 15.5485 7.51575 15.6294 7.9262 15.6294C8.33665 15.6294 8.74308 15.5485 9.12227 15.3914C9.50147 15.2343 9.846 15.0041 10.1362 14.7138L11.7624 13.0876L6.91245 8.2388Z" fill="#D6C34A"/>
                      </svg>
                    : <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.76067 16.2395C5.854 18.2328 8.3465 17.4353 9.344 16.6278C9.859 16.2103 10.0915 15.9403 10.2907 15.7403C10.9882 15.0928 10.944 14.4445 10.4907 13.9262C10.3082 13.7187 9.144 12.6003 8.02734 11.4537C7.449 10.8753 7.05067 10.467 6.709 10.137C6.25317 9.68199 5.854 9.16033 5.25567 9.17533C4.70734 9.17533 4.309 9.65866 3.80984 10.1578C3.2365 10.7312 2.81317 11.4537 2.664 12.102C2.21484 13.9962 2.91317 15.342 3.76067 16.2395ZM3.76067 16.2395L1.6665 18.3328M16.239 3.76283C14.1448 1.76783 11.6607 2.57949 10.664 3.38783C10.1473 3.80616 9.91567 4.07616 9.71567 4.27616C9.01817 4.92449 9.06234 5.57283 9.5165 6.09116C9.5815 6.16616 9.77484 6.35783 10.0457 6.62783M16.239 3.76283C17.0865 4.66033 17.794 6.02116 17.3448 7.91699C17.1948 8.56533 16.7715 9.28783 16.1982 9.86199C15.6998 10.3603 15.3007 10.8445 14.7523 10.8445C14.154 10.8595 13.844 10.4262 13.3865 9.97116M16.239 3.76283L18.3332 1.66699M10.0457 6.62783C10.5298 7.10699 11.2648 7.82949 11.9798 8.56449C12.5582 9.14283 13.0448 9.64116 13.3865 9.97033L12.0848 11.2412M10.0457 6.62783L8.75984 7.92116" stroke="#BE340A" strokeWidth="1.25" strokeLinecap="round"/>
                      </svg>
                  }
                  {loadingAction === 'meta' ? 'Connecting...' : 'Connect'}
                  {loadingAction === 'meta' && <Loader2 className="w-4 h-4 animate-spin" />}
                </button>
            </div>
          )}
        </div>

        {/* TikTok */}
        <div className={`h-[200px] md:h-[419px] flex flex-col justify-between p-4 border drop-shadow-lg ${platformBoxSelected === 'tiktok' ? 'border-khaki-200 drop-shadow-amber-200' : ''} rounded-lg bg-white`} onClick={() => setPlatformBoxSelected('tiktok')}>
          <div>
            <h4 className="text-sm text-gray-500 mb-1">
              {socialAccounts.tiktok?.connected
                ? socialAccounts.tiktok?.assets?.[0]?.name || ''
                : 'Connect your Tiktok account'
              }
            </h4>
            <div className="flex items-center justify-center h-[100px] md:h-[300px]">
              <img src="/logos_tiktok-icon-w100px.png" alt="tiktok" />
            </div>
          </div>
          {socialAccounts.tiktok?.connected ? (
            <div className="flex items-end gap-3">
              <span className="flex items-center gap-2 text-green-600 font-medium">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.4749 2.85005C18.6405 2.67233 18.7307 2.43728 18.7264 2.1944C18.7221 1.95152 18.6237 1.71979 18.452 1.54802C18.2802 1.37626 18.0485 1.27787 17.8056 1.27358C17.5627 1.2693 17.3277 1.35945 17.1499 1.52505L15.1287 3.54505C14.1666 2.80117 12.9663 2.43347 11.7526 2.51077C10.5389 2.58808 9.39493 3.10511 8.53495 3.96505L6.91245 5.58755L6.59995 5.27505C6.42223 5.10945 6.18717 5.0193 5.94429 5.02358C5.70142 5.02787 5.46969 5.12626 5.29792 5.29802C5.12615 5.46979 5.02776 5.70152 5.02348 5.9444C5.01919 6.18728 5.10935 6.42233 5.27495 6.60005L5.58745 6.91255L3.95995 8.54005C3.1 9.40003 2.58298 10.544 2.50567 11.7577C2.42836 12.9714 2.79607 14.1717 3.53995 15.1338L1.52495 17.1501C1.43284 17.2359 1.35896 17.3394 1.30772 17.4544C1.25648 17.5694 1.22893 17.6935 1.22671 17.8194C1.22449 17.9453 1.24764 18.0703 1.29479 18.187C1.34195 18.3038 1.41213 18.4098 1.50115 18.4988C1.59017 18.5879 1.69622 18.6581 1.81295 18.7052C1.92969 18.7524 2.05472 18.7755 2.1806 18.7733C2.30648 18.7711 2.43062 18.7435 2.54562 18.6923C2.66062 18.641 2.76412 18.5672 2.84995 18.4751L4.8662 16.4601C5.82834 17.2039 7.02862 17.5716 8.24233 17.4943C9.45604 17.417 10.6 16.9 11.4599 16.0401L13.0874 14.4126L13.3999 14.7251C13.4858 14.8172 13.5893 14.891 13.7043 14.9423C13.8193 14.9935 13.9434 15.0211 14.0693 15.0233C14.1952 15.0255 14.3202 15.0024 14.4369 14.9552C14.5537 14.9081 14.6597 14.8379 14.7487 14.7488C14.8378 14.6598 14.908 14.5538 14.9551 14.437C15.0023 14.3203 15.0254 14.1953 15.0232 14.0694C15.021 13.9435 14.9934 13.8194 14.9422 13.7044C14.8909 13.5894 14.8171 13.4859 14.7249 13.4001L14.4124 13.0876L16.0349 11.4651C16.8949 10.6051 17.4119 9.46115 17.4892 8.24743C17.5665 7.03372 17.1988 5.83344 16.4549 4.8713L18.4749 2.85005ZM13.0874 11.7626L14.7087 10.1413C14.999 9.85111 15.2292 9.50657 15.3863 9.12738C15.5434 8.74818 15.6243 8.34175 15.6243 7.9313C15.6243 7.52085 15.5434 7.11442 15.3863 6.73523C15.2292 6.35603 14.999 6.0115 14.7087 5.7213L14.2799 5.29255C13.9898 5.00228 13.6452 4.77202 13.266 4.61492C12.8868 4.45783 12.4804 4.37697 12.0699 4.37697C11.6595 4.37697 11.2531 4.45783 10.8739 4.61492C10.4947 4.77202 10.1501 5.00228 9.85995 5.29255L8.2387 6.91255L13.0874 11.7626ZM6.91245 8.2388L5.28745 9.86505C4.99718 10.1552 4.76692 10.4998 4.60982 10.879C4.45272 11.2582 4.37187 11.6646 4.37187 12.0751C4.37187 12.4855 4.45272 12.8919 4.60982 13.2711C4.76692 13.6503 4.99718 13.9949 5.28745 14.2851L5.7162 14.7138C6.00639 15.0041 6.35093 15.2343 6.73012 15.3914C7.10932 15.5485 7.51575 15.6294 7.9262 15.6294C8.33665 15.6294 8.74308 15.5485 9.12227 15.3914C9.50147 15.2343 9.846 15.0041 10.1362 14.7138L11.7624 13.0876L6.91245 8.2388Z" fill="#0A883F"/>
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
            <div className="flex justify-end gap-3">
                  <button
                  onClick={() => handleConnectSocial('tiktok')}
                  disabled={loadingAction !== null}
                  className="flex w-fit items-center gap-2 text-red-600 font-medium hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loadingAction === 'tiktok'
                    ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M18.4749 2.85005C18.6405 2.67233 18.7307 2.43728 18.7264 2.1944C18.7221 1.95152 18.6237 1.71979 18.452 1.54802C18.2802 1.37626 18.0485 1.27787 17.8056 1.27358C17.5627 1.2693 17.3277 1.35945 17.1499 1.52505L15.1287 3.54505C14.1666 2.80117 12.9663 2.43347 11.7526 2.51077C10.5389 2.58808 9.39493 3.10511 8.53495 3.96505L6.91245 5.58755L6.59995 5.27505C6.42223 5.10945 6.18717 5.0193 5.94429 5.02358C5.70142 5.02787 5.46969 5.12626 5.29792 5.29802C5.12615 5.46979 5.02776 5.70152 5.02348 5.9444C5.01919 6.18728 5.10935 6.42233 5.27495 6.60005L5.58745 6.91255L3.95995 8.54005C3.1 9.40003 2.58298 10.544 2.50567 11.7577C2.42836 12.9714 2.79607 14.1717 3.53995 15.1338L1.52495 17.1501C1.43284 17.2359 1.35896 17.3394 1.30772 17.4544C1.25648 17.5694 1.22893 17.6935 1.22671 17.8194C1.22449 17.9453 1.24764 18.0703 1.29479 18.187C1.34195 18.3038 1.41213 18.4098 1.50115 18.4988C1.59017 18.5879 1.69622 18.6581 1.81295 18.7052C1.92969 18.7524 2.05472 18.7755 2.1806 18.7733C2.30648 18.7711 2.43062 18.7435 2.54562 18.6923C2.66062 18.641 2.76412 18.5672 2.84995 18.4751L4.8662 16.4601C5.82834 17.2039 7.02862 17.5716 8.24233 17.4943C9.45604 17.417 10.6 16.9 11.4599 16.0401L13.0874 14.4126L13.3999 14.7251C13.4858 14.8172 13.5893 14.891 13.7043 14.9423C13.8193 14.9935 13.9434 15.0211 14.0693 15.0233C14.1952 15.0255 14.3202 15.0024 14.4369 14.9552C14.5537 14.9081 14.6597 14.8379 14.7487 14.7488C14.8378 14.6598 14.908 14.5538 14.9551 14.437C15.0023 14.3203 15.0254 14.1953 15.0232 14.0694C15.021 13.9435 14.9934 13.8194 14.9422 13.7044C14.8909 13.5894 14.8171 13.4859 14.7249 13.4001L14.4124 13.0876L16.0349 11.4651C16.8949 10.6051 17.4119 9.46115 17.4892 8.24743C17.5665 7.03372 17.1988 5.83344 16.4549 4.8713L18.4749 2.85005ZM13.0874 11.7626L14.7087 10.1413C14.999 9.85111 15.2292 9.50657 15.3863 9.12738C15.5434 8.74818 15.6243 8.34175 15.6243 7.9313C15.6243 7.52085 15.5434 7.11442 15.3863 6.73523C15.2292 6.35603 14.999 6.0115 14.7087 5.7213L14.2799 5.29255C13.9898 5.00228 13.6452 4.77202 13.266 4.61492C12.8868 4.45783 12.4804 4.37697 12.0699 4.37697C11.6595 4.37697 11.2531 4.45783 10.8739 4.61492C10.4947 4.77202 10.1501 5.00228 9.85995 5.29255L8.2387 6.91255L13.0874 11.7626ZM6.91245 8.2388L5.28745 9.86505C4.99718 10.1552 4.76692 10.4998 4.60982 10.879C4.45272 11.2582 4.37187 11.6646 4.37187 12.0751C4.37187 12.4855 4.45272 12.8919 4.60982 13.2711C4.76692 13.6503 4.99718 13.9949 5.28745 14.2851L5.7162 14.7138C6.00639 15.0041 6.35093 15.2343 6.73012 15.3914C7.10932 15.5485 7.51575 15.6294 7.9262 15.6294C8.33665 15.6294 8.74308 15.5485 9.12227 15.3914C9.50147 15.2343 9.846 15.0041 10.1362 14.7138L11.7624 13.0876L6.91245 8.2388Z" fill="#D6C34A"/>
                      </svg>
                    : <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.76067 16.2395C5.854 18.2328 8.3465 17.4353 9.344 16.6278C9.859 16.2103 10.0915 15.9403 10.2907 15.7403C10.9882 15.0928 10.944 14.4445 10.4907 13.9262C10.3082 13.7187 9.144 12.6003 8.02734 11.4537C7.449 10.8753 7.05067 10.467 6.709 10.137C6.25317 9.68199 5.854 9.16033 5.25567 9.17533C4.70734 9.17533 4.309 9.65866 3.80984 10.1578C3.2365 10.7312 2.81317 11.4537 2.664 12.102C2.21484 13.9962 2.91317 15.342 3.76067 16.2395ZM3.76067 16.2395L1.6665 18.3328M16.239 3.76283C14.1448 1.76783 11.6607 2.57949 10.664 3.38783C10.1473 3.80616 9.91567 4.07616 9.71567 4.27616C9.01817 4.92449 9.06234 5.57283 9.5165 6.09116C9.5815 6.16616 9.77484 6.35783 10.0457 6.62783M16.239 3.76283C17.0865 4.66033 17.794 6.02116 17.3448 7.91699C17.1948 8.56533 16.7715 9.28783 16.1982 9.86199C15.6998 10.3603 15.3007 10.8445 14.7523 10.8445C14.154 10.8595 13.844 10.4262 13.3865 9.97116M16.239 3.76283L18.3332 1.66699M10.0457 6.62783C10.5298 7.10699 11.2648 7.82949 11.9798 8.56449C12.5582 9.14283 13.0448 9.64116 13.3865 9.97033L12.0848 11.2412M10.0457 6.62783L8.75984 7.92116" stroke="#BE340A" strokeWidth="1.25" strokeLinecap="round"/>
                      </svg>
                  }
                  {loadingAction === 'tiktok' ? 'Connecting...' : 'Connect'}
                  {loadingAction === 'tiktok' && <Loader2 className="w-4 h-4 animate-spin" />}
                </button>
            </div>
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
