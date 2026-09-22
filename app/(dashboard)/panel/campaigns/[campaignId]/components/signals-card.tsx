"use client";

import { AlertTriangle, Bell, Flame, Info, ShieldAlert, TrendingUp } from "lucide-react";
import type { CampaignSignal } from "@/lib/campaigns";

const SEVERITY_STYLE = {
  critical: {
    icon: ShieldAlert,
    className: "border-red-200 bg-red-50 text-red-800",
    chip: "bg-red-100 text-red-700",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-200 bg-amber-50 text-amber-900",
    chip: "bg-amber-100 text-amber-800",
  },
  info: {
    icon: Info,
    className: "border-gray-200 bg-gray-50 text-gray-700",
    chip: "bg-gray-200 text-gray-700",
  },
} as const;

const TYPE_ICON = {
  fatigue: Flame,
  anomaly: TrendingUp,
  pacing: Bell,
  rejection: ShieldAlert,
  learning: Info,
} as const;

const TYPE_LABEL = {
  fatigue: "Ad fatigue",
  anomaly: "Sudden change",
  pacing: "Budget pacing",
  rejection: "Rejection",
  learning: "Learning phase",
} as const;

/**
 * Campaign health and optimisation signals: ad fatigue, sudden CPM/CPC/CPA/
 * ROAS changes, budget pacing, rejected ads, and the learning phase. Every
 * signal carries the evidence it was derived from.
 */
export function SignalsCard({ signals }: { signals: CampaignSignal[] }) {
  if (!signals.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="h-4 w-4 text-gray-500" aria-hidden />
        <h3 className="text-sm font-gilroy-semibold text-gray-900">
          Health &amp; optimisation signals
        </h3>
      </div>
      <ul className="space-y-2">
        {signals.map((signal) => {
          const style = SEVERITY_STYLE[signal.severity];
          const Icon = TYPE_ICON[signal.type] ?? Bell;
          return (
            <li
              key={signal.id}
              className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${style.className}`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div>
                <p className="font-gilroy-semibold">
                  <span
                    className={`mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-gilroy-bold uppercase ${style.chip}`}
                  >
                    {TYPE_LABEL[signal.type]}
                  </span>
                  {signal.message}
                </p>
                <p className="mt-1 text-xs opacity-80">{signal.evidence}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
