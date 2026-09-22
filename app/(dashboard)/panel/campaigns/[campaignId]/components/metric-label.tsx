"use client";

import { Info } from "lucide-react";
import { metricDefinition } from "@/lib/metric-definitions";

/**
 * A metric name with its definition from the Growdex metric dictionary:
 * what it means, how it is computed when Growdex derives it, and whether the
 * number is platform-reported or calculated.
 */
export function MetricLabel({
  metricKey,
  className = "text-xs font-gilroy-medium text-dimGray md:text-sm",
}: {
  metricKey: string;
  className?: string;
}) {
  const definition = metricDefinition(metricKey);
  const label = definition?.label ?? metricKey;

  return (
    <span className="group relative inline-flex items-center gap-1">
      <h3 className={className}>{label}</h3>
      {definition && (
        <>
          <Info
            className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-gray-600"
            aria-hidden
          />
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-64 rounded-lg bg-gray-900 p-3 text-left text-xs leading-5 text-gray-100 group-hover:block"
          >
            {definition.description}
            {definition.formula && (
              <span className="mt-1 block text-gray-300">
                Growdex-calculated: {definition.formula}
              </span>
            )}
            <span className="mt-1 block font-gilroy-semibold text-khaki-300">
              {definition.source === "growdex"
                ? "Growdex-calculated metric"
                : "Platform-reported metric"}
            </span>
          </span>
        </>
      )}
    </span>
  );
}
