export interface SocialAccountSetupProps {
  meta?: {
    connected: boolean;
    needsReauth?: boolean;
    permissions?: {
      instantForms: boolean;
      missing: string[];
    };
    assets?: MetaAssetUI[];
  };
  tiktok?: {
    connected: boolean;
    needsReauth?: boolean;
    assets?: TikTokAssetUI[];
  };
}

export interface MetaAssetUI {
  id: string;
  adAccountId: string;
  adAccountName: string;
  currency: string | null;
  accountStatus: number | null;
  timezoneName: string | null;
  minDailyBudgetMinor: number | null;
  pageId: string;
  pageName: string;
  instagramActorId: string | null;
  instagramUsername: string | null;
  readyForCampaigns: boolean;
  isPrimary: boolean;
}

export interface TikTokAssetUI {
  id: string;
  advertiserId: string;
  name: string;
  isPrimary: boolean;
}
