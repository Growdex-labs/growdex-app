"use client";

import Link from "next/link";
import { Megaphone, MoreVertical } from "lucide-react";

export interface RecentCampaign {
  id: string;
  name: string;
  publishedAt: string | null;
}

interface RecentCampaignsCardProps {
  campaigns: RecentCampaign[];
}

/** The weekday carries the weight in the design, so it is bold and the time is not. */
const describePublished = (publishedAt: string | null) => {
  if (!publishedAt) return null;
  const published = new Date(publishedAt);
  if (Number.isNaN(published.getTime())) return null;

  return {
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(
      published,
    ),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(published),
  };
};

export function RecentCampaignsCard({ campaigns }: RecentCampaignsCardProps) {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden rounded-lg border border-lavender-100 pb-4">
      <div>
        <div className="flex items-center gap-2 border-b border-lavender-100 bg-lavender-25 px-4 pt-[9px] pb-2">
          <Megaphone className="size-6 shrink-0 text-[#4d4d4d]" aria-hidden />
          <h3 className="flex-1 font-inter text-sm font-bold tracking-[-0.14px] text-[#4d4d4d]">
            Last 7 Campaigns
          </h3>
          <button
            type="button"
            className="text-lavender-200 transition-colors hover:text-[#4d4d4d]"
            aria-label="Recent campaign options"
          >
            <MoreVertical className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-4 pt-[26px]">
          {campaigns.length === 0 ? (
            <p className="font-inter text-sm tracking-[-0.14px] text-bodySecondary">
              No campaigns published yet.
            </p>
          ) : (
            campaigns.map((campaign) => {
              const published = describePublished(campaign.publishedAt);
              return (
                <Link
                  key={campaign.id}
                  href={`/panel/campaigns/${encodeURIComponent(campaign.id)}`}
                  className="flex items-start gap-3"
                >
                  <img
                    src="/icons/campaign-marker.svg"
                    alt=""
                    className="size-4 shrink-0"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-inter text-sm tracking-[-0.14px] text-[#4d4d4d]">
                      {campaign.name}
                    </span>
                    <span className="font-inter text-[10px] tracking-[-0.1px] text-bodySecondary">
                      {published ? (
                        <>
                          Published{" "}
                          <b className="font-bold">{published.weekday}</b> at{" "}
                          {published.time}
                        </>
                      ) : (
                        "Not published yet"
                      )}
                    </span>
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <div className="px-4">
        <Link
          href="/panel/campaigns"
          className="flex items-center justify-center rounded-lg border border-[#b0b4c2] px-6 py-2 font-inter text-sm tracking-[-0.14px] text-[#b0b4c2] transition-colors hover:border-lavender-300 hover:text-lavender-300"
        >
          See all campaigns
        </Link>
      </div>
    </div>
  );
}
