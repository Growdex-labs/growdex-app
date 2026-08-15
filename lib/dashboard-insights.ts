import type { PanelMetrics } from "@/lib/panel";

export type DashboardInsightCopy = {
  headline: string;
  insights: string[];
  recommendations: string[];
};

const rate = (value: number | undefined) =>
  typeof value === "number" && Number.isFinite(value)
    ? `${Number(value.toFixed(1))}%`
    : null;

export const buildDashboardInsights = (
  metrics: PanelMetrics,
): DashboardInsightCopy => {
  const metaCtr = rate(metrics.byPlatform.meta?.ctr);
  const tiktokCtr = rate(metrics.byPlatform.tiktok?.ctr);
  const meta = metrics.byPlatform.meta?.ctr;
  const tiktok = metrics.byPlatform.tiktok?.ctr;
  const insights: string[] = [];
  const recommendations: string[] = [];

  if (metaCtr && tiktokCtr && meta !== undefined && tiktok !== undefined) {
    insights.push(
      `Meta click-through rate is ${metaCtr}. TikTok is ${tiktokCtr}.`,
    );
    if (tiktok > meta) {
      insights.push("TikTok is currently the stronger click-through platform.");
      recommendations.push(
        "Study the TikTok creatives that are earning the higher CTR and test that angle on Meta.",
      );
      recommendations.push(
        "Tighten Meta targeting or swap the weaker Meta creative before raising spend.",
      );
    } else if (meta > tiktok) {
      insights.push("Meta is currently the stronger click-through platform.");
      recommendations.push(
        "Keep the Meta setup that is winning clicks and test a closer version on TikTok.",
      );
      recommendations.push(
        "Review TikTok creative and first-second hooks before adding budget there.",
      );
    } else {
      insights.push("Both platforms are delivering a similar click-through rate.");
      recommendations.push(
        "Run a creative test on one platform at a time so the next lift is easy to read.",
      );
    }
  } else if (metaCtr) {
    insights.push(`Meta click-through rate is ${metaCtr}.`);
    recommendations.push(
      "Add TikTok delivery to compare click-through rate across platforms.",
    );
  } else if (tiktokCtr) {
    insights.push(`TikTok click-through rate is ${tiktokCtr}.`);
    recommendations.push(
      "Add Meta delivery to compare click-through rate across platforms.",
    );
  } else {
    insights.push(
      "Click a chart after campaigns start delivering to see platform-level click-through rate.",
    );
  }

  if (metrics.totalClicks > 0 && metrics.totalImpressions > 0) {
    insights.push(
      `${metrics.totalClicks.toLocaleString("en-US")} clicks from ${metrics.totalImpressions.toLocaleString("en-US")} impressions.`,
    );
  }

  return {
    headline:
      metrics.totalClicks > 0
        ? "Here are the main click-through results. Ask for a change or pick an action below."
        : "Here are your main results. Click any chart to learn more.",
    insights,
    recommendations,
  };
};

export const insightMessageText = (copy: DashboardInsightCopy) =>
  [
    copy.headline,
    "",
    "Key insights",
    ...copy.insights.map((line) => `• ${line}`),
    ...(copy.recommendations.length
      ? ["", "Recommendations", ...copy.recommendations.map((line) => `• ${line}`)]
      : []),
  ].join("\n");
