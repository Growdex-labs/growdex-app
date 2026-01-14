import React, { useState } from "react";
import AdFormSection from "./ad-form";
import AdPreviewSection from "./ad-preview-section";
import { FacebookIcon } from "lucide-react";

export default function CreateAdLayout() {
  const [activePlatform, setActivePlatform] = useState<"meta" | "tiktok">(
    "meta"
  );
  const [headline, setHeadline] = useState<string>("");
  const [creative, setCreative] = useState<{
    type: "image" | "video";
    url: string;
  } | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [callToAction, setCallToAction] = useState<string>("Join Now");

  const calculateHeadlineOptimization = (text: string): number => {
    if (!text) return 0;
    let score = 0;
    if (text.length >= 20 && text.length <= 60) score += 50;
    if (/\d/.test(text)) score += 25;
    if (text.split(" ").length >= 3) score += 25;
    return Math.min(score, 100);
  };

  const headlineOptimization = calculateHeadlineOptimization(headline);

  return (
    <div className="relative">
      {/* Platform Selection Tabs */}
      <div className="flex gap-2 border-b border-gray-300 mb-4 md:mb-6">
        <button
          onClick={() => setActivePlatform("meta")}
          className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-bold transition-all flex-1 relative ${
            activePlatform === "meta"
              ? "text-khaki-300"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="hidden sm:inline">Meta Creative</span>
          <span className="sm:hidden">Meta</span>
          {activePlatform === "meta" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-khaki-300 rounded-t-md"></div>
          )}
        </button>
        <button
          onClick={() => setActivePlatform("tiktok")}
          className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-bold transition-all flex-1 relative ${
            activePlatform === "tiktok"
              ? "text-khaki-300"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className="hidden sm:inline">TikTok Creative</span>
          <span className="sm:hidden">TikTok</span>
          {activePlatform === "tiktok" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-khaki-300 rounded-t-md"></div>
          )}
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
        {activePlatform === "meta" ? (
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        ) : (
          <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
          </div>
        )}
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight">
          Setup {activePlatform === "meta" ? "Meta" : "TikTok"} Ad Creative
        </h1>
      </div>

      {/* Ad form and preview */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-6 lg:h-[calc(100vh-280px)]">
        {/* Ad Form Section */}
        <div className="lg:overflow-y-auto relative flex flex-col lg:hide-scrollbar order-2 lg:order-1">
          <div className="flex-1">
            <AdFormSection
              platform={activePlatform}
              headline={headline}
              setHeadline={setHeadline}
              headlineOptimization={headlineOptimization}
              creative={creative}
              setCreative={setCreative}
              caption={caption}
              setCaption={setCaption}
              callToAction={callToAction}
              setCallToAction={setCallToAction}
            />
          </div>

          {/* Save Button */}
          <div className="lg:sticky bottom-0 bg-white p-3 md:p-4 mt-4 lg:mt-auto">
            <button className="w-full lg:w-auto px-6 py-2.5 md:py-3 bg-khaki-200 text-gray-900 font-semibold rounded-lg hover:bg-khaki-300 transition">
              Save Changes
            </button>
          </div>
        </div>

        {/* Ad Preview Section */}
        <div className="lg:sticky top-0 h-fit order-1 lg:order-2">
          <AdPreviewSection
            activePlatform={activePlatform}
            headline={headline}
            caption={caption}
            creative={creative}
            callToAction={callToAction}
          />
        </div>
      </div>
    </div>
  );
}
