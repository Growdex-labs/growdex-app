"use client";

import React from "react";
import { Facebook, Instagram as InstagramIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PluggedIcon, PluggedOutIcon } from "@/components/svg";

interface PlatformSectionProps {
  progressTab: number;
  setProgressTab: (tab: number) => void;
  selectedPlatforms: {
    meta: boolean;
    tiktok: boolean;
  };
  setSelectedPlatforms: React.Dispatch<
    React.SetStateAction<{
      meta: boolean;
      tiktok: boolean;
    }>
  >;
  brandName: string;
  instagramAccountName: string;
  readOnly?: boolean;
}

export const PlatformSection = ({
  progressTab,
  setProgressTab,
  selectedPlatforms,
  setSelectedPlatforms,
  brandName,
  instagramAccountName,
  readOnly = false,
}: PlatformSectionProps) => {
  return (
    <div
      className={`bg-white rounded-xl p-4 border ${
        progressTab === 1 ? "border-darkkhaki-200" : "border-transparent"
      }`}
      onClick={() => setProgressTab(1)}
    >
      <div>
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
            <div className="w-0 h-32 border border-peru-200" />
          </div>
          <div className="w-full">
            <label
              htmlFor="platform"
              className="block text-sm font-medium text-gray-800 font-gilroy-bold"
            >
              Choose platform
            </label>
            <p className="mt-2 font-gilroy-medium text-gray-500">
              What platforms are you running this ad on?{" "}
              <span className="ml-2 hover:underline text-peru-200 cursor-pointer">
                Connect new account
              </span>
            </p>

            {/* Platform Cards */}
            <div className="flex mt-4 gap-4">
              {/* Meta Card */}
              <label
                htmlFor="meta"
                className="inline-flex items-start gap-2 cursor-pointer group bg-gray-50 p-2 rounded-xl"
              >
                <Checkbox
                  id="meta"
                  checked={selectedPlatforms.meta}
                  onCheckedChange={(checked) =>
                    setSelectedPlatforms((prev) => ({
                      ...prev,
                      meta: Boolean(checked),
                    }))
                  }
                  disabled={readOnly}
                  className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                />

                {/* Meta Logo */}
                <img src="/logos_meta-icon.png" alt="meta" className="mt-2" />

                {/* Facebook Account */}
                <div className="mb-3 border-r pr-2 mt-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <div className="p-1 bg-gray-600 rounded-full">
                      <Facebook className="w-4 h-4 text-white" />
                    </div>
                    <span>{brandName}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <PluggedIcon fill="#0A883F" />
                    <span className="text-xs text-green-600 font-medium">
                      Connected
                    </span>
                  </div>
                </div>

                {/* Instagram Account */}
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <InstagramIcon className="w-4 h-4 text-gray-500" />
                    <span>{instagramAccountName}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1"
                    >
                      <PluggedOutIcon />
                      Connect
                    </button>
                  </div>
                </div>
              </label>

              {/* TikTok Card */}
              <label
                htmlFor="tiktok"
                className="inline-flex items-start gap-2 cursor-pointer group flex-1 mt-2 bg-mintcream-50 p-2 rounded-xl"
              >
                <Checkbox
                  id="tiktok"
                  checked={selectedPlatforms.tiktok}
                  onCheckedChange={(checked) =>
                    setSelectedPlatforms((prev) => ({
                      ...prev,
                      tiktok: Boolean(checked),
                    }))
                  }
                  disabled={readOnly}
                  className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                />

                <div className="flex gap-2 items-center">
                  {/* TikTok Logo */}
                  <img src="/logos_tiktok-icon.png" alt="tiktok-icon" />

                  {/* TikTok Account */}
                  <div className="flex flex-col gap-2 items-start">
                    <p className="text-sm font-medium text-gray-700">
                      <span>{brandName}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <PluggedIcon fill="#0A883F" />
                      <span className="text-xs text-green-600 font-medium">
                        Connected
                      </span>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
