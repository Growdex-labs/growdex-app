import { useState } from "react";
import { SparklesIcon, ChevronDown, Loader2 } from "lucide-react";
import { requestCampaignCreativeSuggestion } from "@/lib/campaigns";
import CreativeAndCaption from "./form-sections/creative-and-caption";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface AdFormSectionProps {
  campaignId: string;
  platform: "meta" | "tiktok";
  headline: string;
  setHeadline: (value: string) => void;
  creative: { type: "image" | "video"; url: string } | null;
  setCreative: (
    creative: { type: "image" | "video"; url: string } | null
  ) => void;
  caption: string;
  setCaption: (value: string) => void;
  callToAction: string;
  setCallToAction: (value: string) => void;
}

export default function AdFormSection({
  campaignId,
  platform,
  headline,
  setHeadline,
  creative,
  setCreative,
  caption,
  setCaption,
  callToAction,
  setCallToAction,
}: AdFormSectionProps) {
  const [headlineSuggestion, setHeadlineSuggestion] = useState<{
    value: string;
    rationale: string;
  } | null>(null);
  const [headlineLoading, setHeadlineLoading] = useState(false);
  const [headlineError, setHeadlineError] = useState<string | null>(null);
  const ctaOptions = [
    "Join Now",
    "Learn More",
    "Sign Up",
    "Get Started",
    "Shop Now",
    "Download",
    "Contact Us",
    "Apply Now",
    "Subscribe",
    "Book Now",
  ];

  const improveHeadline = async () => {
    if (headlineLoading) return;
    setHeadlineLoading(true);
    setHeadlineError(null);
    setHeadlineSuggestion(null);
    try {
      const suggestion = await requestCampaignCreativeSuggestion(campaignId, {
        platform,
        field: "headline",
        currentValue: headline,
        headline,
        caption,
      });
      setHeadlineSuggestion({
        value: suggestion.value,
        rationale: suggestion.rationale,
      });
    } catch (failure) {
      setHeadlineError(
        failure instanceof Error
          ? failure.message
          : "Could not improve the headline.",
      );
    } finally {
      setHeadlineLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      {/* Headline */}
      {platform === "meta" && (
        <div className="bg-slate-50/60 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Headline</h2>
          </div>

          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="5,000 things you need to be successful"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki-300"
          />

          <button
            type="button"
            onClick={() => void improveHeadline()}
            disabled={headlineLoading}
            className="mt-3 flex items-center gap-1 text-sm font-medium text-khaki-300 transition-colors hover:text-khaki-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {headlineLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SparklesIcon className="size-4" />
            )}
            {headlineLoading ? "Improving headline…" : "Improve headline performance"}
          </button>
          {headlineError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {headlineError}
            </p>
          )}
          {headlineSuggestion && (
            <div className="mt-3 rounded-lg border border-violet-100 bg-violet-50 p-3">
              <p className="text-sm font-medium text-gray-900">{headlineSuggestion.value}</p>
              <p className="mt-1 text-xs leading-5 text-violet-700">
                {headlineSuggestion.rationale}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHeadline(headlineSuggestion.value);
                    setHeadlineSuggestion(null);
                  }}
                  className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Use suggestion
                </button>
                <button
                  type="button"
                  onClick={() => setHeadlineSuggestion(null)}
                  className="rounded-lg border border-violet-200 px-3 py-1.5 text-xs text-violet-700"
                >
                  Keep current
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Creative and Caption */}
      <div className="bg-slate-50/60 p-4 rounded-lg">
        <CreativeAndCaption
          campaignId={campaignId}
          platform={platform}
          creative={creative}
          setCreative={setCreative}
          caption={caption}
          setCaption={setCaption}
          headline={headline}
        />
      </div>

      <div className="bg-slate-50/60 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Call to Action</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-left flex items-center justify-between hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-khaki-300">
              <span>{callToAction}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {ctaOptions.map((cta) => (
              <DropdownMenuItem
                key={cta}
                onClick={() => setCallToAction(cta)}
                className={callToAction === cta ? "bg-gray-100" : ""}
              >
                {cta}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="bg-slate-50/60 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Website link</h2>
        <input
          type="text"
          placeholder="www.growdex.ai"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki-300"
        />
      </div>
    </div>
  );
}
