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
        totalSpend: 1542000.50,
        totalImpressions: 2450000,
        cpa: 450.25,
        cpc: 25.50,
        audienceReception: 'Strong',
        byPlatform: {
          meta: { ctr: 2.45 },
          tiktok: { ctr: 3.12 },
        },
      };
    }
    return null;
  }
}
