"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";

// A megaphone/bullhorn with sound waves coming out of the wide end.
function LoudMegaphone({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 13.5v-3l11-4v11z" />
      <path d="M6 13.2v2.6a1.3 1.3 0 0 0 2.6 0V14" />
      <path d="M17 9a4 4 0 0 1 0 6" />
      <path d="M19.5 6.8a8 8 0 0 1 0 10.4" />
    </svg>
  );
}

type Platform = "meta" | "tiktok";

interface ManualGoalScreenProps {
  /** Called with the selected goal + destination labels. */
  onConfirm?: (goalLabel: string, destinationLabel: string) => void;
  /** Platforms chosen in the previous step (drives engagement options). */
  platforms?: Platform[];
}

const DEFAULT_BANNER =
  "TikTok outperforms Meta by 70% when running awareness ads. You should consider a TikTok heavy video campaign.";

const GOALS = [
  { id: "leads", label: "Lead Generation", optimizeFor: "Leads" },
  { id: "sales", label: "Sales", optimizeFor: "Sales" },
  { id: "awareness", label: "Awareness", optimizeFor: "Awareness" },
  { id: "engagement", label: "Engagement", optimizeFor: "Engagement" },
  { id: "app", label: "App promotion", optimizeFor: "App installs" },
];

interface OptionItem {
  id: string;
  label: string;
}

interface OptConfig {
  heading: string;
  /** When set, the options are wrapped in a tinted "destination" panel. */
  destinationLabel?: string;
  input: "radio" | "checkbox";
  options: OptionItem[];
  showNote?: boolean;
  tall?: boolean;
  /** Custom banner text for this sub-screen (defaults to the TikTok tip). */
  bannerText?: string;
}

// Engagement options depend on the selected platform(s).
const ENGAGEMENT_META: OptConfig = {
  heading: "What is the goal for your campaign?",
  destinationLabel: "What type of engagement do you want?",
  input: "checkbox",
  options: [
    { id: "likes", label: "Increase likes, comments and shares" },
    {
      id: "conversations",
      label: "Receive conversations through Messenger/Instagram Direct",
    },
    { id: "fb-event", label: "Promote a Facebook Event" },
  ],
};

const ENGAGEMENT_TIKTOK: OptConfig = {
  heading: "What is the goal for your campaign?",
  destinationLabel: "What type of engagement do you want?",
  input: "checkbox",
  options: [
    { id: "video-engagement", label: "Increase video engagement." },
    {
      id: "followers",
      label: "Increase followers and community engagement.",
    },
  ],
};

const ENGAGEMENT_BOTH: OptConfig = {
  heading: "What is the goal for your campaign?",
  destinationLabel: "What type of engagement do you want?",
  input: "checkbox",
  options: [
    { id: "content", label: "Engage with my Content" },
    { id: "video-views", label: "Increase Video Views" },
    { id: "messages", label: "Receive Messages" },
    { id: "community", label: "Grow my Community" },
  ],
  bannerText:
    "Community growth works differently across platforms. Growdex will optimize each platform using its closest equivalent objective.",
};

// The optimization / destination sub-screen varies per goal.
const OPTIMIZATION_BY_GOAL: Record<string, OptConfig> = {
  leads: {
    heading: "What is the goal for your campaign?",
    destinationLabel: "Where is the destination for your campaign?",
    input: "checkbox",
    options: [
      { id: "website", label: "Website" },
      { id: "instant-form", label: "Instant Form" },
      { id: "whatsapp", label: "WhatsApp" },
    ],
    showNote: true,
  },
  awareness: {
    heading: "What is the optimization goal for your campaign?",
    destinationLabel: "Where is the destination for your campaign?",
    input: "radio",
    options: [
      { id: "website", label: "Visit my website" },
      { id: "video", label: "Watch my video" },
      { id: "profile", label: "Follow my profile" },
    ],
    showNote: true,
  },
  sales: {
    heading: "What matters most?",
    input: "radio",
    options: [
      { id: "purchase", label: "Purchase" },
      { id: "add-to-cart", label: "Add To Cart" },
    ],
    tall: true,
  },
  app: {
    heading: "What matters most?",
    input: "radio",
    options: [
      { id: "app-installs", label: "App Installs" },
      { id: "app-events", label: "App Events" },
    ],
    tall: true,
  },
};

const DEFAULT_OPT = OPTIMIZATION_BY_GOAL.leads;

function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full border ${
        checked ? "border-gray-800" : "border-gray-300"
      }`}
    >
      {checked && <span className="w-2.5 h-2.5 rounded-full bg-gray-800" />}
    </span>
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`shrink-0 flex items-center justify-center w-5 h-5 rounded border ${
        checked ? "bg-khaki-200 border-khaki-300" : "bg-white border-gray-300"
      }`}
    >
      {checked && <Check className="w-3 h-3 text-gray-900" />}
    </span>
  );
}

export function ManualGoalScreen({
  onConfirm,
  platforms = ["meta", "tiktok"] as Platform[],
}: ManualGoalScreenProps) {
  const [subStep, setSubStep] = useState<"goal" | "destination">("goal");
  const [goal, setGoal] = useState("leads");
  const [destination, setDestination] = useState("website");

  const selectedGoal = GOALS.find((g) => g.id === goal);

  // Engagement options depend on which platform(s) were chosen.
  const engagementOpt = (() => {
    const hasMeta = platforms.includes("meta");
    const hasTiktok = platforms.includes("tiktok");
    if (hasMeta && hasTiktok) return ENGAGEMENT_BOTH;
    if (hasTiktok) return ENGAGEMENT_TIKTOK;
    return ENGAGEMENT_META;
  })();

  const opt =
    goal === "engagement"
      ? engagementOpt
      : (OPTIMIZATION_BY_GOAL[goal] ?? DEFAULT_OPT);
  const selectedOption = opt.options.find((o) => o.id === destination);

  const handleNext = () => {
    if (subStep === "goal") {
      setDestination(opt.options[0]?.id ?? "");
      setSubStep("destination");
    } else {
      onConfirm?.(
        selectedGoal?.label ?? "",
        selectedOption?.label ?? opt.options[0]?.label ?? "",
      );
    }
  };

  const renderOptions = () =>
    opt.options.map((o) => {
      const selected = destination === o.id;
      return (
        <div key={o.id}>
          <button
            type="button"
            onClick={() => setDestination(o.id)}
            className={`w-full flex items-center gap-3 rounded-xl border bg-white px-4 text-left transition-colors ${
              opt.tall ? "py-8" : "py-3.5"
            } ${
              selected
                ? "border-khaki-300"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {opt.input === "checkbox" ? (
              <CheckBox checked={selected} />
            ) : (
              <Radio checked={selected} />
            )}
            <span className="text-sm text-gray-800">{o.label}</span>
          </button>

          {selected && opt.showNote && selectedGoal?.optimizeFor && (
            <p className="mt-2 text-[11px] text-gray-400">
              Growdex will optimise your settings for{" "}
              <span className="font-medium text-gray-600">
                {selectedGoal.optimizeFor}
              </span>
            </p>
          )}
        </div>
      );
    });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
      {subStep === "goal" ? (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            What is the goal for your campaign?
          </h2>

          <div className="space-y-3">
            {GOALS.map((g) => {
              const selected = goal === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                    selected
                      ? "border-khaki-300"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Radio checked={selected} />
                  <span className="text-sm text-gray-800">{g.label}</span>
                  {selected && g.optimizeFor && (
                    <span className="ml-auto rounded-md bg-dimYellow/50 px-2.5 py-1 text-[11px] text-gray-500">
                      Growdex will optimise your settings for{" "}
                      <span className="font-medium text-gray-700">
                        {g.optimizeFor}
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-6">{opt.heading}</h2>

          {opt.destinationLabel ? (
            <div className="rounded-xl bg-dimYellow/40 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                {opt.destinationLabel}
              </p>
              <div className="space-y-3">{renderOptions()}</div>
            </div>
          ) : (
            <div className="space-y-4">{renderOptions()}</div>
          )}
        </>
      )}

      {/* Recommendation banner */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-full bg-violet-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full flex items-center justify-center bg-linear-to-br from-emerald-400 to-teal-500 shrink-0">
            <LoudMegaphone className="w-4 h-4 text-white" />
          </span>
          <p className="text-xs text-gray-600 leading-relaxed">
            {subStep === "destination"
              ? (opt.bannerText ?? DEFAULT_BANNER)
              : DEFAULT_BANNER}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-violet-500 hover:text-violet-600 whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Setup the ad with TikTok
        </button>
      </div>

      {/* Next */}
      <button
        type="button"
        onClick={handleNext}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300 transition-colors"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-900">
          <ArrowRight className="w-3 h-3 text-white" />
        </span>
        Next
      </button>
    </div>
  );
}

export default ManualGoalScreen;
