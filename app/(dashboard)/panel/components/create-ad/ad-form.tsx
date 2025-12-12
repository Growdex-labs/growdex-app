import React from "react";
import { OptimizationBadge } from "../optimization-badge";
import { SparklesIcon, ChevronDown } from "lucide-react";
import CreativeAndCaption from "./form-sections/creative-and-caption";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface AdFormSectionProps {
  platform: "meta" | "tiktok";
  headline: string;
  setHeadline: (value: string) => void;
  headlineOptimization: number;
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
  platform,
  headline,
  setHeadline,
  headlineOptimization,
  creative,
  setCreative,
  caption,
  setCaption,
  callToAction,
  setCallToAction,
}: AdFormSectionProps) {
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
  return (
    <div className="space-y-4">
      {/* Headline */}
      {platform === "meta" && (
        <div className="bg-slate-50/60 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Headline</h2>
            <OptimizationBadge percentage={headlineOptimization} size="sm" />
          </div>

          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="5,000 things you need to be successful"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki-300"
          />

          <button className="text-khaki-300 font-medium text-sm flex items-center gap-1 mt-3 hover:text-khaki-400 transition-colors">
            <SparklesIcon className="inline-flex size-4" /> Improve headline
            performance
          </button>
        </div>
      )}

      {/* Creative and Caption */}
      <div className="bg-slate-50/60 p-4 rounded-lg">
        <CreativeAndCaption
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
