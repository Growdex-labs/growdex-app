"use client";

import { useId } from "react";
import { Sparkles } from "lucide-react";

interface GradientSparkleProps {
  className?: string;
}

/** A Sparkles icon filled (not just stroked) with the purple gradient. */
export function GradientSparkle({ className = "" }: GradientSparkleProps) {
  const gradId = `sparkle-${useId().replace(/:/g, "")}`;

  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E0B2FF" />
            <stop offset="100%" stopColor="#BE67F9" />
          </linearGradient>
        </defs>
      </svg>
      <Sparkles
        className={className}
        style={{ fill: `url(#${gradId})`, stroke: `url(#${gradId})` }}
      />
    </>
  );
}

export default GradientSparkle;
