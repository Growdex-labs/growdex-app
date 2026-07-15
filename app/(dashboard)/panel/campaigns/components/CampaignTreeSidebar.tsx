"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronDown, MoreHorizontal, TriangleAlert } from "lucide-react";

interface AdSet {
  id: string;
  name: string;
  warning?: boolean;
}

interface AdGroup {
  id: string;
  name: string;
  warning?: boolean;
  adSets: AdSet[];
}

interface CampaignTreeSidebarProps {
  campaignName?: string;
  adGroups?: AdGroup[];
}

// Static/mock structure matching the design. Swap for real data later.
const DEFAULT_AD_GROUPS: AdGroup[] = [
  {
    id: "ad-group-1",
    name: "Ad group",
    warning: true,
    adSets: [
      { id: "ad-set-1", name: "Ad set", warning: true },
      { id: "ad-set-2", name: "Ad set" },
    ],
  },
];

export function CampaignTreeSidebar({
  campaignName = "Untitled Campaign",
  adGroups = DEFAULT_AD_GROUPS,
}: CampaignTreeSidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(adGroups.map((g) => [g.id, true])),
  );

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const truncatedName =
    campaignName.length > 18 ? `${campaignName.slice(0, 18)}..` : campaignName;

  return (
    <div className="w-64 h-screen flex flex-col bg-white border-r border-gray-200 p-4">
      {/* Back */}
      <Link
        href="/panel/campaigns"
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Campaign name */}
      <div className="mt-6 px-4 py-2.5 rounded-lg bg-khaki-200 text-sm font-semibold text-gray-900 truncate">
        {truncatedName}
      </div>

      {/* Ad groups tree */}
      <div className="mt-3 space-y-2">
        {adGroups.map((group) => {
          const isOpen = expanded[group.id];
          return (
            <div key={group.id}>
              {/* Ad group row */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-900 text-khaki-200">
                <button
                  type="button"
                  onClick={() => toggle(group.id)}
                  className="shrink-0"
                  aria-label={isOpen ? "Collapse ad group" : "Expand ad group"}
                  aria-expanded={isOpen}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                  />
                </button>
                <div className="flex flex-1 items-center gap-1.5">
                  <span className="text-sm font-semibold">{group.name}</span>
                  {group.warning && (
                    <TriangleAlert className="w-4 h-4 text-khaki-200" />
                  )}
                </div>
                <button
                  type="button"
                  className="shrink-0 text-gray-400 hover:text-white transition-colors"
                  aria-label="Ad group options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Ad sets */}
              {isOpen && (
                <div className="relative ml-3 mt-2 space-y-2 pl-4">
                  {/* vertical tree line */}
                  <span className="absolute left-0 -top-2 bottom-4 w-px bg-gray-200" />
                  {group.adSets.map((adSet) => (
                    <div key={adSet.id} className="relative">
                      {/* horizontal connector */}
                      <span className="absolute -left-4 top-1/2 w-4 h-px bg-gray-200" />
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-white">
                        <div className="flex flex-1 items-center gap-1.5">
                          <span className="text-sm text-gray-700">
                            {adSet.name}
                          </span>
                          {adSet.warning && (
                            <TriangleAlert className="w-4 h-4 text-khaki-300" />
                          )}
                        </div>
                        <button
                          type="button"
                          className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
                          aria-label="Ad set options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CampaignTreeSidebar;
