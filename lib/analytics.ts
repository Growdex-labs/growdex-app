export type AnalyticsProps = Record<string, string | number | boolean>;

export type AnalyticsFlow = "signup" | "onboarding" | "campaign_create";

export const CAMPAIGN_CREATE_SCREENS = [
  "setup",
  "platform",
  "goals",
  "strategy",
  "audience",
  "budget",
  "ads",
  "review",
] as const;

export type CampaignCreateScreen = (typeof CAMPAIGN_CREATE_SCREENS)[number];

export const ONBOARDING_SCREENS = {
  1: "profile",
  2: "goals",
  3: "connect",
} as const;

type RybbitClient = {
  event: (name: string, properties?: AnalyticsProps) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  clearUserId: () => void;
};

declare global {
  interface Window {
    rybbit?: RybbitClient;
  }
}

const pending: Array<(client: RybbitClient) => void> = [];
let flushTimer: number | undefined;

export const isAnalyticsEnabled = () =>
  process.env.NEXT_PUBLIC_APP_ENV === "production";

const getClient = (): RybbitClient | undefined => {
  if (typeof window === "undefined") return undefined;
  return window.rybbit;
};

export const bindAnalyticsClient = () => {
  const client = getClient();
  if (!client) return false;
  if (flushTimer !== undefined) {
    window.clearInterval(flushTimer);
    flushTimer = undefined;
  }
  const queued = pending.splice(0, pending.length);
  for (const run of queued) run(client);
  return true;
};

const startFlushRetry = () => {
  if (typeof window === "undefined" || flushTimer !== undefined) return;
  let attempts = 0;
  flushTimer = window.setInterval(() => {
    attempts += 1;
    if (bindAnalyticsClient() || attempts >= 20) {
      window.clearInterval(flushTimer);
      flushTimer = undefined;
    }
  }, 250);
};

const withClient = (run: (client: RybbitClient) => void) => {
  if (typeof window === "undefined" || !isAnalyticsEnabled()) return;
  const client = getClient();
  if (client) {
    run(client);
    return;
  }
  pending.push(run);
  startFlushRetry();
};

const internalSessionId = () => {
  const key = "growdex_analytics_session";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const created = window.crypto.randomUUID();
  window.sessionStorage.setItem(key, created);
  return created;
};

const trackInternal = (name: string, properties?: AnalyticsProps) => {
  if (typeof window === "undefined") return;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) return;
  void fetch(`${baseUrl}/events/track`, {
    method: "POST",
    credentials: "include",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: internalSessionId(),
      name,
      pathname: window.location.pathname,
      properties,
    }),
  }).catch(() => undefined);
};

export const track = (name: string, properties?: AnalyticsProps) => {
  trackInternal(name, properties);
  withClient((client) => client.event(name, properties));
};

export const identifyUser = (
  userId: string,
  traits?: Record<string, unknown>,
) => {
  withClient((client) => client.identify(userId, traits));
};

export const analyticsUserId = (me: {
  id?: string | null;
  profile?: { id?: string } | null;
}): string | undefined => {
  if (typeof me.id === "string" && me.id) return me.id;
  if (typeof me.profile?.id === "string" && me.profile.id) return me.profile.id;
  return undefined;
};

export const clearIdentifiedUser = () => {
  withClient((client) => client.clearUserId());
};

export const trackScreenViewed = (
  flow: AnalyticsFlow,
  screen: string,
  extra?: AnalyticsProps,
) => {
  track("screen_viewed", { flow, screen, ...extra });
};

export const trackScreenCompleted = (
  flow: AnalyticsFlow,
  screen: string,
  extra?: AnalyticsProps,
) => {
  track("screen_completed", { flow, screen, ...extra });
};

export const trackScreenBlocked = (
  flow: AnalyticsFlow,
  screen: string,
  reason: string,
  extra?: AnalyticsProps,
) => {
  track("screen_blocked", { flow, screen, reason, ...extra });
};

export const resetAnalyticsForTests = () => {
  pending.splice(0, pending.length);
  if (typeof window !== "undefined" && flushTimer !== undefined) {
    window.clearInterval(flushTimer);
    flushTimer = undefined;
  }
};
