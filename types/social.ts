export interface SocialAccountSetupProps {
  meta?: {
    connected: boolean;
    needsReauth?: boolean;
    assets?: MetaAssetUI[];
  };
  tiktok?: {
    connected: boolean;
    needsReauth?: boolean;
    assets?: TikTokAssetUI[];
  };
}

export interface MetaAssetUI {
  adAccountId: string;
  adAccountName: string;
  pageName: string;
  instagram?: string;
  isPrimary: boolean;
}

export interface TikTokAssetUI {
  advertiserId: string;
  name: string;
  isPrimary: boolean;
}
