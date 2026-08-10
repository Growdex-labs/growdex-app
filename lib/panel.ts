import { apiFetch } from "./auth";

export const fetchPanelMetrics = async () => {
  try {
    const res = await apiFetch('/campaigns/metrics/dashboard', { method: 'GET' });
    if (!res.ok) throw new Error("Failed to fetch metrics");
    return res.json();
  } catch (error) {
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      console.warn('[DEV] Backend metrics unreachable — using mock data');
      return {
        spendByCurrency: [{ currency: 'NGN', amount: 1542000.5 }],
        byCurrency: [
          {
            currency: 'NGN',
            spend: 1542000.5,
            impressions: 2450000,
            clicks: 60470,
            conversions: 3425,
            cpa: 450.25,
            cpc: 25.5,
            cpm: 629.39,
          },
        ],
        totalImpressions: 2450000,
        audienceReception: 'Strong',
        byPlatform: {
          meta: { ctr: 2.45 },
          tiktok: { ctr: 3.12 },
        },
      };
    }
    throw error;
  }
}
