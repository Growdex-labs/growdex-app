"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { PURPLE_GRADIENT } from "./AiCampaignChat";
import { DemographicsForm } from "./DemographicsForm";
import { AudienceReachCard } from "./AudienceReachCard";

interface ReviewPublishScreenProps {
  stepper: ReactNode;
  campaignName: string;
  goal?: string;
  destination?: string;
  onPublish?: () => void;
  onSchedule?: () => void;
}

const FIXES = [
  "Your caption is not optimized for your audience. Key words are missing.",
  "Your caption is not optimized for your audience. Key words are missing.",
  "Your caption is not optimized for your audience. Key words are missing.",
];

function ReadinessMeter({ value }: { value: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const strokeW = 8;
  const gap = 0.04 * c; // gap between the fill and the dark segment

  // Animate from 0 to `value` on mount so the meter fills like a loader.
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf: number;
    const duration = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setProgress(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  // A rounded arc from startFrac..endFrac (fractions of the circle), inset by
  // half a gap on each side so both ends show their own rounded cap.
  const arc = (startFrac: number, endFrac: number) => {
    const len = Math.max((endFrac - startFrac) * c - gap, 0);
    return {
      strokeDasharray: `${len} ${c - len}`,
      strokeDashoffset: -(startFrac * c + gap / 2),
    };
  };

  const fill = arc(0, progress / 100); // filled percentage
  const dark = arc(value / 100, 1); // unselected remainder

  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        <g transform="rotate(-90 50 50)">
          {/* Light green base track */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#C9EFD9"
            strokeWidth={strokeW}
          />
          {/* Dark green = unselected part (own rounded edges) */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#2E9E63"
            strokeWidth={strokeW}
            strokeLinecap="round"
            {...dark}
          />
          {/* Normal green = the filled percentage (own rounded edges) */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#6FC593"
            strokeWidth={strokeW}
            strokeLinecap="round"
            {...fill}
          />
        </g>
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
        style={{ color: "#15803D" }}
      >
        {Math.round(progress)}%
      </span>
    </div>
  );
}

export function ReviewPublishScreen({
  stepper,
  campaignName,
  goal = "Lead Generation",
  destination = "Website",
  onPublish,
  onSchedule,
}: ReviewPublishScreenProps) {
  return (
    <>
      <div className="mb-8">{stepper}</div>

      {/* Top actions */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onPublish}
          className="rounded-lg bg-khaki-200 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300 transition-colors"
        >
          Publish Ad
        </button>
        <button
          type="button"
          onClick={onSchedule}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: campaign details + previews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-900">{campaignName}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              Goal: {goal}
              <span className="rounded-md bg-khaki-200 opacity-50 px-2 py-0.5 text-xs font-bold text-gray-900">
                {destination}
              </span>
            </div>

            <div className="mt-5">
              <DemographicsForm ageOptions={["35-44", "45-54"]} />
            </div>
          </div>

          {/* Ad previews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    G
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-gray-900">
                      Growdex Limited
                    </p>
                    <p className="text-xs text-gray-400">Sponsored</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-700">
                  We&apos;d love to hear from you. Whether you have questions
                  about upcoming events, …
                </p>
                <div className="mt-3 h-40 rounded-lg bg-gray-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: reach + readiness + fixes */}
        <div className="space-y-6">
          {/* Ad reach */}
          <AudienceReachCard />

          {/* Ad readiness metric */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 ">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">Ad readiness metric</p>
              <div className="flex justify-center">
                <ReadinessMeter value={94} />
              </div>
              <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Ad is great!
              </span>
            </div>

            <hr className="my-4 border-gray-200 w-full mx-auto" />
            {/* Fixes */}
            <div className="mt-4">
              <div className="flex items-center mb-3 gap-1.5">
                <p className="text-sm font-medium text-gray-800">
                  12 fixes located
                </p>
                <span className="rounded-full bg-khaki-200 px-2 py-0.5 text-[11px] font-medium text-gray-900">
                  Low priority
                </span>
              </div>

              <p className="text-xs font-medium text-gray-700 flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-green-400 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                </span>
                Campaign
              </p>
              <ul className="space-y-2">
                {FIXES.map((fix, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed"
                  >
                    <span className="mt-0.5 flex items-center justify-center w-4 h-4 rounded-full border-2 border-green-400 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                    </span>
                    {fix}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                style={{ background: PURPLE_GRADIENT }}
                className="mt-4 w-full inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-white hover:opacity-90"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Fix all with AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReviewPublishScreen;
