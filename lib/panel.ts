import { apiFetch } from "./auth";

/**
 * Spend is reported per currency because a campaign bills in the currency of its
 * ad account. Two accounts on different currencies never sum into one figure.
 */
export interface SpendByCurrency {
  currency: string;
  amount: number;
}

export interface PanelCurrencyMetrics {
  currency: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cpc: number;
  cpa: number;
  cpm: number;
  /** Revenue over spend. Null while the campaigns have no spend to divide by. */
  roas: number | null;
}

export interface PanelPlatformMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  reach: number;
  ctr: number;
  spendByCurrency: SpendByCurrency[];
  revenueByCurrency: SpendByCurrency[];
}

/** Reporting groups Facebook and Instagram together, so Meta is one platform. */
export type PanelPlatform = "meta" | "tiktok";

export interface DailySpend {
  date: string;
  byPlatform: Partial<Record<PanelPlatform, SpendByCurrency[]>>;
}

export interface PanelMetrics {
  spendByCurrency: SpendByCurrency[];
  revenueByCurrency: SpendByCurrency[];
  byCurrency: PanelCurrencyMetrics[];
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalReach: number;
  ctr: number;
  byPlatform: Partial<Record<PanelPlatform, PanelPlatformMetrics>>;
  dailySpend: DailySpend[];
}

const EMPTY_METRICS: PanelMetrics = {
  spendByCurrency: [],
  revenueByCurrency: [],
  byCurrency: [],
  totalImpressions: 0,
  totalClicks: 0,
  totalConversions: 0,
  totalReach: 0,
  ctr: 0,
  byPlatform: {},
  dailySpend: [],
};

export const fetchPanelMetrics = async (): Promise<PanelMetrics | null> => {
  try {
    const res = await apiFetch('/campaigns/metrics/dashboard', { method: 'GET' });
    if (!res.ok) throw new Error("Failed to fetch metrics");
    const data = await res.json();
    return { ...EMPTY_METRICS, ...data };
  } catch (error) {
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      console.warn('[DEV] Backend metrics unreachable — using mock data');
      return {
        spendByCurrency: [{ currency: 'NGN', amount: 1586980.98 }],
        revenueByCurrency: [{ currency: 'NGN', amount: 4567890.08 }],
        byCurrency: [
          {
            currency: 'NGN',
            spend: 1586980.98,
            impressions: 12900345,
            clicks: 189430,
            conversions: 53567,
            revenue: 4567890.08,
            cpc: 8.38,
            cpa: 29.63,
            cpm: 123.02,
            roas: 2.88,
          },
        ],
        totalImpressions: 12900345,
        totalClicks: 189430,
        totalConversions: 53567,
        totalReach: 136789,
        ctr: 1.47,
        byPlatform: {
          meta: {
            impressions: 8455220,
            clicks: 124300,
            conversions: 36780,
            reach: 92400,
            ctr: 1.47,
            spendByCurrency: [{ currency: 'NGN', amount: 1043210.5 }],
            revenueByCurrency: [{ currency: 'NGN', amount: 3120450.2 }],
          },
          tiktok: {
            impressions: 4445125,
            clicks: 65130,
            conversions: 16787,
            reach: 44389,
            ctr: 1.46,
            spendByCurrency: [{ currency: 'NGN', amount: 543770.48 }],
            revenueByCurrency: [{ currency: 'NGN', amount: 1447439.88 }],
          },
        },
        dailySpend: [
          { date: '2026-08-06', byPlatform: { meta: [{ currency: 'NGN', amount: 38898 }], tiktok: [{ currency: 'NGN', amount: 111629 }] } },
          { date: '2026-08-07', byPlatform: { meta: [{ currency: 'NGN', amount: 95299 }], tiktok: [{ currency: 'NGN', amount: 42688 }] } },
          { date: '2026-08-08', byPlatform: { meta: [{ currency: 'NGN', amount: 61896 }], tiktok: [{ currency: 'NGN', amount: 68676 }] } },
          { date: '2026-08-09', byPlatform: { meta: [{ currency: 'NGN', amount: 72066 }], tiktok: [{ currency: 'NGN', amount: 132447 }] } },
          { date: '2026-08-10', byPlatform: { meta: [{ currency: 'NGN', amount: 193932 }], tiktok: [{ currency: 'NGN', amount: 57377 }] } },
        ],
      };
    }
    return null;
  }
}
