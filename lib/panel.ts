import { apiFetch } from "./auth";

export const fetchPanelMetrics = async () => {
  const res = await apiFetch('/campaigns/metrics/dashboard', { method: 'GET' });

  if (!res.ok) return null;

  return res.json();
}
