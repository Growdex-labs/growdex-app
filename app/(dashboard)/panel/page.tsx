"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { PanelLayout } from "./components/panel-layout";
import { CTRLineChart } from "./components/ctr-line-chart";
import { DonutChart } from "./components/donut-chart";
import {
  DashboardAiPanel,
  type AiMessage,
} from "./components/dashboard-ai-panel";
import { DashboardAiBar } from "./components/dashboard-ai-bar";
import { useMe } from "@/context/me-context";
import {
  MoreVertical,
  TrendingDown,
  ChevronDown,
  Facebook,
  Instagram,
  Search,
  Bell,
  HelpCircle,
  Megaphone,
} from "lucide-react";

function TikTokNote({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const METRIC_CARDS = [
  { title: "Lifetime ROAS", value: "N567,890.08", trend: "35.7%" },
  { title: "Reach", value: "136,789", trend: "35.7%" },
  { title: "Conversions", value: "53,567", trend: "55.7%" },
];

const AD_SPEND_GROUPS = [
  { date: "21/09/2025", bars: [45, 62, 72] },
  { date: "21/09/2025", bars: [78, 45, 40] },
  { date: "21/09/2025", bars: [48, 72, 52] },
  { date: "21/09/2025", bars: [55, 72, 82] },
  { date: "21/09/2025", bars: [95, 52, 45] },
];

const CAMPAIGNS = [
  "Growdex Awareness Campaign",
  "Growdex One Up",
  "Real Estate Q3",
  "Newsletter Leads",
];

const CARD_RECOMMENDATIONS: Record<string, string> = {
  "Lifetime ROAS":
    "ROAS dropped 35.7% this period. Shift ~20% of budget from TikTok to Meta where CPA is lower, and refresh your top-performing creative to recover returns.",
  Reach:
    "Reach is solid at 136,789. To grow it, widen your audience age range and add 1–2 lookalike audiences built from recent converters.",
  Conversions:
    "Conversions are trending up. Double down by raising budget on your best-converting ad set and launching a retargeting campaign for cart abandoners.",
  "Lifetime Ad Spend":
    "Spend is concentrated on a few days. Move to daily budgets to smooth pacing and avoid burning through budget early in the week.",
  "Click-Through Rate":
    "CTR is 79% — excellent. Keep the creative but A/B test 2–3 new headlines to sustain it as fatigue sets in.",
  "Total Impressions":
    "Impressions are healthy. Watch frequency — keep it under 3 to avoid ad fatigue and rising CPMs.",
};

export default function PanelPage() {
  const { me } = useMe();
  const firstName = me?.profile?.firstName ?? "there";

  const now = new Date();
  const dateStr = `${now.getDate()} ${now.toLocaleString("en-US", {
    month: "long",
  })}, ${now.getFullYear()}`;

  const [panelOpen, setPanelOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hi! Click any card or ask me anything about your campaigns and I'll suggest ways to improve.",
    },
  ]);
  const msgId = useRef(0);
  // Typed factory so `sender` is always the "ai" | "user" literal, never widened.
  const makeMsg = (sender: AiMessage["sender"], text: string): AiMessage => ({
    id: `m${(msgId.current += 1)}`,
    sender,
    text,
  });

  // Append to the ongoing conversation so multiple issues can be discussed.
  const openForCard = (title: string) => {
    setMessages((prev) => [
      ...prev,
      makeMsg("user", `How can I improve my ${title}?`),
      makeMsg(
        "ai",
        CARD_RECOMMENDATIONS[title] ??
          "Here are some recommendations for this metric.",
      ),
    ]);
    setPanelOpen(true);
  };

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      makeMsg("user", text),
      makeMsg(
        "ai",
        "Got it — analysing that now and I'll suggest the best next step.",
      ),
    ]);
    setPanelOpen(true);
  };

  const selectCampaign = (name: string) => {
    setMessages((prev) => [
      ...prev,
      makeMsg("user", `Let's talk about "${name}".`),
      makeMsg(
        "ai",
        `Sure — "${name}". Ask me anything: how it's performing, how to boost reach, or where to trim spend.`,
      ),
    ]);
    setPanelOpen(true);
  };

  return (
    <PanelLayout>
      <div className="flex items-start gap-6 p-6 md:p-8">
        <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-0.5 text-sm text-gray-400">
              Welcome back, {firstName}
              <span className="mx-1.5 text-gray-300">·</span>
              <span suppressHydrationWarning>{dateStr}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-52 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for anything"
                className="w-full rounded-full bg-gray-100 pl-9 pr-3 py-2.5 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              className="relative text-gray-500 hover:text-gray-700"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-khaki-200 text-[10px] font-semibold text-gray-900">
                20
              </span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </button>

            <Link
              href="/panel/campaigns/new"
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Create campaign
            </Link>
          </div>

          <hr className="w-full h-px bg-slate-500" />
        </header>

        {/* All-time Performance */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">
            All-time Performance
          </h2>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            Filter by:
            <button className="inline-flex items-center gap-1 font-medium text-gray-700">
              Date <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {METRIC_CARDS.map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() => openForCard(card.title)}
              className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-violet-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{card.title}</span>
                <MoreVertical className="w-4 h-4 text-gray-300" />
              </div>
              <div className="mt-1 text-2xl font-bold text-gray-900">
                {card.value}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-500">
                {card.trend} <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Facebook className="w-3.5 h-3.5 text-blue-600" /> 23,900
                </span>
                <span className="inline-flex items-center gap-1">
                  <Instagram className="w-3.5 h-3.5 text-rose-500" /> 23,900
                </span>
                <span className="inline-flex items-center gap-1">
                  <TikTokNote className="w-3 h-3 text-gray-900" /> 16,000
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Ad spend + Last 7 campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <button
            type="button"
            onClick={() => openForCard("Lifetime Ad Spend")}
            className="lg:col-span-2 text-left bg-white border border-gray-200 rounded-xl p-6 hover:border-violet-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">Lifetime Ad Spend</span>
              <MoreVertical className="w-4 h-4 text-gray-300" />
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              N1,586,980.98
            </div>

            {/* Bar chart (mock) */}
            <div className="mt-6 flex gap-3">
              {/* Y axis */}
              <div className="flex h-56 flex-col justify-between py-1 text-[10px] text-gray-400 shrink-0">
                <span>14,500.00</span>
                <span>12,500.00</span>
                <span>10,000.00</span>
                <span>7,500.00</span>
                <span>2,500.00</span>
              </div>

              {/* Plot */}
              <div className="flex-1">
                <div className="relative h-56">
                  {/* Dashed gridlines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="border-t border-dashed border-gray-200"
                      />
                    ))}
                  </div>

                  {/* Bars */}
                  <div className="relative flex h-full items-end justify-around">
                    {AD_SPEND_GROUPS.map((g, i) => (
                      <div key={i} className="flex items-end gap-1.5 h-full">
                        {/* Facebook */}
                        <div
                          style={{
                            height: `${g.bars[0]}%`,
                            backgroundColor: "#FFE95C",
                          }}
                          className="w-5 rounded-full"
                        />
                        {/* Instagram */}
                        <div
                          style={{
                            height: `${g.bars[1]}%`,
                            backgroundColor: "#AD9D37",
                          }}
                          className="w-5 rounded-full"
                        />
                        {/* TikTok */}
                        <div
                          style={{
                            height: `${g.bars[2]}%`,
                            backgroundColor: "#332C00",
                          }}
                          className="w-5 rounded-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Labels under each group */}
                <div className="mt-2 flex justify-around">
                  {AD_SPEND_GROUPS.map((g, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Facebook className="w-3 h-3" />
                        <Instagram className="w-3 h-3" />
                        <TikTokNote className="w-2.5 h-2.5" />
                      </div>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-[9px] text-gray-400">
                        {g.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </button>

          {/* Last 7 Campaigns */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-800">
                <Megaphone className="w-4 h-4 text-violet-500" />
                Last 7 Campaigns
              </span>
              <MoreVertical className="w-4 h-4 text-gray-300" />
            </div>

            <div className="space-y-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex items-center justify-center w-4 h-4 rounded-full border-2 border-violet-200 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Growdex Awareness Campaign
                    </p>
                    <p className="text-xs text-gray-400">
                      Published <span className="font-medium text-gray-500">Monday</span> at
                      21:40pm
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-auto pt-8 w-full text-sm text-gray-500"
            >
              <span className="block rounded-lg border border-gray-200 py-2.5 hover:bg-gray-50">
                See all campaigns
              </span>
            </button>
          </div>
        </div>

        {/* CTR + Impressions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => openForCard("Click-Through Rate")}
            className="text-left bg-white border border-gray-200 rounded-xl p-6 hover:border-violet-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium text-gray-800">
                  Click-Through Rate
                </span>
                <span className="text-gray-300">ROAS</span>
                <span className="text-gray-300">Clicks</span>
                <span className="text-gray-300">Conversions</span>
                <span className="text-gray-300">CPA</span>
              </div>
              <MoreVertical className="w-4 h-4 text-gray-300" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-3">79%</div>
            <CTRLineChart />
          </button>

          <button
            type="button"
            onClick={() => openForCard("Total Impressions")}
            className="text-left bg-white border border-gray-200 rounded-xl p-6 hover:border-violet-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-sm font-medium text-gray-800">
                Total Impressions
              </span>
              <MoreVertical className="w-4 h-4 text-gray-300" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-6">1,204,980</div>
            <DonutChart meta={62} tiktok={38} />
          </button>
        </div>

        {/* Docked AI bar — hidden while the panel is open */}
        {!panelOpen && (
          <DashboardAiBar
            campaigns={CAMPAIGNS}
            onSend={handleSend}
            onSelectCampaign={selectCampaign}
          />
        )}
        </div>

        {/* Embedded AI panel — sits beside the content and pushes it */}
        {panelOpen && (
          <DashboardAiPanel
            messages={messages}
            onSend={handleSend}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>
    </PanelLayout>
  );
}
