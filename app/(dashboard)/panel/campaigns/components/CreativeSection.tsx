"use client";

import React from "react";
import { MoreVertical as MoreVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreativeDraft, isVideoUrl } from "@/lib/campaign-shared";

interface CreativeSectionProps {
  progressTab: number;
  setProgressTab: (tab: number) => void;
  selectedPlatforms: {
    meta: boolean;
    tiktok: boolean;
  };
  creativesByPlatform: Partial<Record<"meta" | "tiktok", CreativeDraft>>;
  openCreativeModal: (type: "meta" | "tiktok") => void;
  readOnly?: boolean;
}

export const CreativeSection = ({
  progressTab,
  setProgressTab,
  selectedPlatforms,
  creativesByPlatform,
  openCreativeModal,
  readOnly = false,
}: CreativeSectionProps) => {
  return (
    <div
      className={`bg-white rounded-xl p-4 border ${
        progressTab === 4 ? "border-darkkhaki-200" : "border-transparent"
      }`}
      onClick={() => setProgressTab(4)}
    >
      <div>
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
            <div className="w-0 h-full border border-peru-200" />
          </div>
          <div className="w-full">
            <label
              htmlFor="platform"
              className="block text-sm font-medium text-gray-800 font-gilroy-bold"
            >
              Setup Creative
            </label>

            {/* Creative cards */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {/* Meta Creative */}
              <div
                className={`bg-gray-50 rounded-xl p-2 space-y-2 ${
                  selectedPlatforms.meta ? "" : "opacity-50"
                }`}
                aria-disabled={!selectedPlatforms.meta}
              >
                <div className="flex justify-between gap-2 px-2">
                  <div className="flex gap-2">
                    <img
                      src="/logos_meta-icon.png"
                      alt="meta-icon"
                      className="h-11"
                    />
                    <div>
                      <p className="font-medium">
                        {creativesByPlatform.meta?.headline ||
                          creativesByPlatform.meta?.heading ||
                          "Header"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {creativesByPlatform.meta?.primaryText ||
                          creativesByPlatform.meta?.subheading ||
                          "Subhead"}
                      </p>
                    </div>
                  </div>
                  <MoreVerticalIcon />
                </div>

                {creativesByPlatform.meta?.mediaUrl ? (
                  isVideoUrl(creativesByPlatform.meta.mediaUrl) ? (
                    <video
                      src={creativesByPlatform.meta.mediaUrl}
                      className="w-full h-44 object-cover rounded-lg bg-white"
                      controls
                      playsInline
                    />
                  ) : (
                    <img
                      src={creativesByPlatform.meta.mediaUrl}
                      alt="Meta creative preview"
                      className="w-full h-44 object-cover rounded-lg bg-white"
                    />
                  )
                ) : (
                  <img
                    src="/media-creative.png"
                    alt="media"
                    className="w-full h-44 object-cover rounded-lg"
                  />
                )}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    className="bg-khaki-200 hover:bg-khaki-300 text-black"
                    onClick={() => openCreativeModal("meta")}
                    disabled={readOnly || !selectedPlatforms.meta}
                  >
                    {creativesByPlatform.meta?.mediaUrl
                      ? "Replace creative"
                      : "Add creative"}
                  </Button>
                </div>
              </div>
              {/* Tiktok Creative */}
              <div
                className={`bg-gray-50 rounded-xl p-2 space-y-2 ${
                  selectedPlatforms.tiktok ? "" : "opacity-50"
                }`}
                aria-disabled={!selectedPlatforms.tiktok}
              >
                <div className="flex justify-between gap-2 px-2">
                  <div className="flex gap-2">
                    <img
                      src="/logos_tiktok-icon.png"
                      alt="tiktok-icon"
                      className="h-11"
                    />
                    <div>
                      <p className="font-medium">
                        {creativesByPlatform.tiktok?.headline ||
                          creativesByPlatform.tiktok?.heading ||
                          "Header"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {creativesByPlatform.tiktok?.primaryText ||
                          creativesByPlatform.tiktok?.subheading ||
                          "Subhead"}
                      </p>
                    </div>
                  </div>
                  <MoreVerticalIcon />
                </div>

                {creativesByPlatform.tiktok?.mediaUrl ? (
                  isVideoUrl(creativesByPlatform.tiktok.mediaUrl) ? (
                    <video
                      src={creativesByPlatform.tiktok.mediaUrl}
                      className="w-full h-44 object-cover rounded-lg bg-white"
                      controls
                      playsInline
                    />
                  ) : (
                    <img
                      src={creativesByPlatform.tiktok.mediaUrl}
                      alt="TikTok creative preview"
                      className="w-full h-44 object-cover rounded-lg bg-white"
                    />
                  )
                ) : (
                  <img
                    src="/media-creative.png"
                    alt="media"
                    className="w-full h-44 object-cover rounded-lg"
                  />
                )}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    className="bg-khaki-200 hover:bg-khaki-300 text-black"
                    onClick={() => openCreativeModal("tiktok")}
                    disabled={readOnly || !selectedPlatforms.tiktok}
                  >
                    {creativesByPlatform.tiktok?.mediaUrl
                      ? "Replace creative"
                      : "Add creative"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
