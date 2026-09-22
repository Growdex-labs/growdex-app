import type { CampaignGoal, CampaignPlatform } from "./campaigns";
import { apiFetch } from "./auth";

/** A value is null when a provider did not make that metric available. */
export type AnalyticsValue = number | null;
export type AnalyticsEntityLevel = "campaign" | "ad_set" | "ad_group" | "ad" | "creative";
export type AnalyticsDataStatus = "final" | "estimated" | "delayed" | "partial";
export type AnalyticsMetricName =
  | "spend" | "impressions" | "reach" | "clicks" | "link_clicks"
  | "outbound_clicks" | "landing_page_views" | "engagements" | "leads"
  | "conversions" | "conversion_value" | "add_to_cart" | "initiated_checkout"
  | "video_views" | "video_views_25" | "video_views_50" | "video_views_75"
  | "video_views_100" | "frequency" | "cpm" | "ctr" | "cpc"
  | "conversion_rate" | "cost_per_result" | "roas";

export interface AttributionContext {
  event?: string;
  window?: string;
  /** True only for a conversion reported by the ad platform. */
  platformAttributed?: boolean;
}

export interface NormalizedMetric {
  name: AnalyticsMetricName;
  value: AnalyticsValue;
  platform: CampaignPlatform;
  campaignId: string;
  objective: CampaignGoal;
  entityLevel: AnalyticsEntityLevel;
  timestamp: string;
  /** Preserve the provider name; derived values use a Growdex formula name. */
  sourceMetricName: string;
  dataStatus: AnalyticsDataStatus;
  currency?: string;
  attribution?: AttributionContext;
  adAccountId?: string;
  adSetOrGroupId?: string;
  adId?: string;
  creativeId?: string;
}

export interface PlatformNativeMetric {
  name: string;
  value: AnalyticsValue;
  sourceMetricName?: string;
}

const NATIVE_METRIC_MAP: Record<CampaignPlatform, Record<string, AnalyticsMetricName>> = {
  // These are intentionally explicit: no platform metric is normalized unless
  // its provider definition is known and retained in sourceMetricName.
  meta: { spend: "spend", impressions: "impressions", reach: "reach", inline_link_clicks: "link_clicks", outbound_clicks: "outbound_clicks", landing_page_view: "landing_page_views", lead: "leads", purchase: "conversions", purchase_value: "conversion_value", video_view: "video_views" },
  tiktok: { spend: "spend", impressions: "impressions", reach: "reach", clicks: "clicks", click: "clicks", landing_page_view: "landing_page_views", conversion: "conversions", total_purchase_value: "conversion_value", video_play_actions: "video_views" },
};

export const normalizePlatformMetric = (
  metric: PlatformNativeMetric,
  context: Omit<NormalizedMetric, "name" | "value" | "sourceMetricName">,
): NormalizedMetric | null => {
  const name = NATIVE_METRIC_MAP[context.platform][metric.name];
  if (!name) return null;
  return { ...context, name, value: metric.value, sourceMetricName: metric.sourceMetricName ?? metric.name };
};

export interface MetricDefinition {
  displayName: string;
  description: string;
  type: "native" | "derived";
  formula?: string;
  requires?: AnalyticsMetricName[];
  currency: boolean;
  attribution: boolean;
  objectives: CampaignGoal[];
}

const ALL_OBJECTIVES: CampaignGoal[] = ["AWARENESS", "TRAFFIC", "ENGAGEMENT", "SALES", "LEADS", "APP_PROMOTION"];

/** Shared by API consumers, charts, exports, and grounded AI prompts. */
export const CAMPAIGN_METRIC_DICTIONARY: Record<AnalyticsMetricName, MetricDefinition> = {
  spend: { displayName: "Spend", description: "Amount charged by the advertising platform.", type: "native", currency: true, attribution: false, objectives: ALL_OBJECTIVES },
  impressions: { displayName: "Impressions", description: "Times ads were displayed.", type: "native", currency: false, attribution: false, objectives: ALL_OBJECTIVES },
  reach: { displayName: "Reach", description: "Unique people reached when supplied by the platform.", type: "native", currency: false, attribution: false, objectives: ALL_OBJECTIVES },
  clicks: { displayName: "Clicks", description: "Platform-defined click metric; source name identifies its definition.", type: "native", currency: false, attribution: false, objectives: ALL_OBJECTIVES },
  link_clicks: { displayName: "Link clicks", description: "Clicks on a destination link when supplied.", type: "native", currency: false, attribution: false, objectives: ["TRAFFIC", "LEADS", "SALES", "APP_PROMOTION"] },
  outbound_clicks: { displayName: "Outbound clicks", description: "Platform-defined outbound clicks.", type: "native", currency: false, attribution: false, objectives: ["TRAFFIC", "LEADS", "SALES"] },
  landing_page_views: { displayName: "Landing page views", description: "Landing-page loads reported by the platform.", type: "native", currency: false, attribution: false, objectives: ["TRAFFIC", "LEADS", "SALES"] },
  engagements: { displayName: "Engagements", description: "Platform-defined engagement total.", type: "native", currency: false, attribution: false, objectives: ["AWARENESS", "ENGAGEMENT"] },
  leads: { displayName: "Leads", description: "Lead actions reported by the platform.", type: "native", currency: false, attribution: true, objectives: ["LEADS"] },
  conversions: { displayName: "Conversions", description: "Primary conversion event reported by the platform.", type: "native", currency: false, attribution: true, objectives: ["SALES", "LEADS", "APP_PROMOTION"] },
  conversion_value: { displayName: "Conversion value", description: "Platform-attributed conversion value.", type: "native", currency: true, attribution: true, objectives: ["SALES", "APP_PROMOTION"] },
  add_to_cart: { displayName: "Add to cart", description: "Add-to-cart events when supplied.", type: "native", currency: false, attribution: true, objectives: ["SALES"] },
  initiated_checkout: { displayName: "Initiated checkout", description: "Checkout-start events when supplied.", type: "native", currency: false, attribution: true, objectives: ["SALES"] },
  video_views: { displayName: "Video views", description: "Provider-specific video-view metric; inspect source name for definition.", type: "native", currency: false, attribution: false, objectives: ALL_OBJECTIVES },
  video_views_25: { displayName: "25% video plays", description: "Video plays reaching 25%.", type: "native", currency: false, attribution: false, objectives: ALL_OBJECTIVES },
  video_views_50: { displayName: "50% video plays", description: "Video plays reaching 50%.", type: "native", currency: false, attribution: false, objectives: ALL_OBJECTIVES },
  video_views_75: { displayName: "75% video plays", description: "Video plays reaching 75%.", type: "native", currency: false, attribution: false, objectives: ALL_OBJECTIVES },
  video_views_100: { displayName: "100% video plays", description: "Video plays reaching completion.", type: "native", currency: false, attribution: false, objectives: ALL_OBJECTIVES },
  frequency: { displayName: "Frequency", description: "Average impressions per person reached.", type: "derived", formula: "impressions / reach", requires: ["impressions", "reach"], currency: false, attribution: false, objectives: ALL_OBJECTIVES },
  cpm: { displayName: "CPM", description: "Cost per 1,000 impressions.", type: "derived", formula: "spend / impressions × 1,000", requires: ["spend", "impressions"], currency: true, attribution: false, objectives: ALL_OBJECTIVES },
  ctr: { displayName: "CTR", description: "Relevant click metric divided by corresponding impressions.", type: "derived", formula: "clicks / impressions × 100", requires: ["clicks", "impressions"], currency: false, attribution: false, objectives: ALL_OBJECTIVES },
  cpc: { displayName: "CPC", description: "Cost per selected click metric.", type: "derived", formula: "spend / clicks", requires: ["spend", "clicks"], currency: true, attribution: false, objectives: ALL_OBJECTIVES },
  conversion_rate: { displayName: "Conversion rate", description: "Primary result divided by its declared denominator.", type: "derived", currency: false, attribution: true, objectives: ["LEADS", "SALES", "APP_PROMOTION"] },
  cost_per_result: { displayName: "Cost per result", description: "Spend divided by the objective primary result.", type: "derived", currency: true, attribution: true, objectives: ALL_OBJECTIVES },
  roas: { displayName: "ROAS", description: "Platform-attributed conversion value divided by spend.", type: "derived", formula: "conversion value / spend", requires: ["conversion_value", "spend"], currency: false, attribution: true, objectives: ["SALES", "APP_PROMOTION"] },
};

const PRIMARY_RESULT_BY_OBJECTIVE: Record<CampaignGoal, AnalyticsMetricName> = {
  AWARENESS: "reach", TRAFFIC: "link_clicks", ENGAGEMENT: "engagements", LEADS: "leads", SALES: "conversions", APP_PROMOTION: "conversions",
};

export const primaryResultForObjective = (objective: CampaignGoal): AnalyticsMetricName =>
  PRIMARY_RESULT_BY_OBJECTIVE[objective];

const divide = (numerator: AnalyticsValue, denominator: AnalyticsValue, multiplier = 1): AnalyticsValue =>
  numerator === null || denominator === null || denominator <= 0 ? null : (numerator / denominator) * multiplier;

/** Derive values only from available values in the same currency/entity period. */
export const deriveMetrics = (metrics: NormalizedMetric[]): NormalizedMetric[] => {
  const values = new Map(metrics.map((metric) => [metric.name, metric.value]));
  const template = metrics[0];
  if (!template) return [];
  const primary = primaryResultForObjective(template.objective);
  const derived: Array<[AnalyticsMetricName, AnalyticsValue]> = [
    ["frequency", divide(values.get("impressions") ?? null, values.get("reach") ?? null)],
    ["cpm", divide(values.get("spend") ?? null, values.get("impressions") ?? null, 1000)],
    ["ctr", divide(values.get("clicks") ?? values.get("link_clicks") ?? null, values.get("impressions") ?? null, 100)],
    ["cpc", divide(values.get("spend") ?? null, values.get("clicks") ?? values.get("link_clicks") ?? null)],
    ["cost_per_result", divide(values.get("spend") ?? null, values.get(primary) ?? null)],
    ["roas", divide(values.get("conversion_value") ?? null, values.get("spend") ?? null)],
  ];
  return derived.map(([name, value]) => ({ ...template, name, value, sourceMetricName: `growdex:${CAMPAIGN_METRIC_DICTIONARY[name].formula ?? name}`, dataStatus: template.dataStatus }));
};

/** Never combines different reporting currencies. */
export const groupMetricsByCurrency = (metrics: NormalizedMetric[]) =>
  metrics.reduce((groups, metric) => {
    const currency = metric.currency ?? "unitless";
    groups.set(currency, [...(groups.get(currency) ?? []), metric]);
    return groups;
  }, new Map<string, NormalizedMetric[]>());

export interface AnalyticsHealthSignal { type: "performance_change" | "potential_creative_fatigue"; message: string; supportingMetrics: AnalyticsMetricName[]; }

export const detectHealthSignals = (current: Map<AnalyticsMetricName, AnalyticsValue>, previous: Map<AnalyticsMetricName, AnalyticsValue>, threshold = 0.2): AnalyticsHealthSignal[] => {
  const change = (name: AnalyticsMetricName) => {
    const now = current.get(name); const before = previous.get(name);
    return now === null || before === null || now === undefined || before === undefined || before === 0 ? null : (now - before) / Math.abs(before);
  };
  const ctrDown = change("ctr"); const frequencyUp = change("frequency"); const cpcUp = change("cpc");
  const signals: AnalyticsHealthSignal[] = [];
  if (frequencyUp !== null && ctrDown !== null && frequencyUp >= threshold && ctrDown <= -threshold) signals.push({ type: "potential_creative_fatigue", message: "Frequency increased while CTR declined over the selected period.", supportingMetrics: ["frequency", "ctr"] });
  if (cpcUp !== null && cpcUp >= threshold) signals.push({ type: "performance_change", message: "CPC increased materially compared with the previous period.", supportingMetrics: ["cpc"] });
  return signals;
};

export interface CampaignAnalyticsSnapshot {
  metrics: NormalizedMetric[];
  lastUpdatedAt: string | null;
  syncStatus: "syncing" | "ready" | "partial" | "failed";
}

const isMetric = (value: unknown): value is NormalizedMetric => {
  if (!value || typeof value !== "object") return false;
  const metric = value as Partial<NormalizedMetric>;
  return typeof metric.name === "string" && typeof metric.platform === "string" &&
    typeof metric.campaignId === "string" && typeof metric.objective === "string" &&
    typeof metric.entityLevel === "string" && typeof metric.timestamp === "string" &&
    typeof metric.sourceMetricName === "string" && typeof metric.dataStatus === "string" &&
    (typeof metric.value === "number" || metric.value === null);
};

/**
 * Reads persisted analytics from Growdex's backend. This deliberately has no
 * browser-side provider fallback: platform data must be authorized, synced,
 * and timestamped server-side.
 */
export const fetchCampaignAnalytics = async (campaignId: string, query: { from?: string; to?: string; level?: AnalyticsEntityLevel; compare?: "previous" } = {}): Promise<CampaignAnalyticsSnapshot> => {
  const parameters = new URLSearchParams();
  if (query.from) parameters.set("from", query.from);
  if (query.to) parameters.set("to", query.to);
  if (query.level) parameters.set("level", query.level);
  if (query.compare) parameters.set("compare", query.compare);
  const suffix = parameters.size ? `?${parameters}` : "";
  const response = await apiFetch(`/campaigns/${encodeURIComponent(campaignId)}/analytics${suffix}`, { method: "GET" });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error("Could not retrieve campaign analytics.");
  const data = body && typeof body === "object" && "data" in body ? (body as { data: unknown }).data : body;
  if (!data || typeof data !== "object") throw new Error("Campaign analytics returned an invalid response.");
  const snapshot = data as Partial<CampaignAnalyticsSnapshot>;
  if (!Array.isArray(snapshot.metrics) || !snapshot.metrics.every(isMetric) ||
    !["syncing", "ready", "partial", "failed"].includes(snapshot.syncStatus ?? "") ||
    !(snapshot.lastUpdatedAt === null || typeof snapshot.lastUpdatedAt === "string")) {
    throw new Error("Campaign analytics returned an invalid response.");
  }
  return snapshot as CampaignAnalyticsSnapshot;
};
