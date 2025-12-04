"use client";

import React, { useState } from "react";
import {
  Bold,
  Italic,
  ListIcon,
  MoreVertical,
  SparklesIcon,
  Strikethrough,
  Type,
  Underline,
} from "lucide-react";

interface CreativeAndCaptionProps {
  platform: "meta" | "tiktok";
  creative: {
    type: "image" | "video";
    url: string;
  } | null;
  setCreative: (
    creative: { type: "image" | "video"; url: string } | null
  ) => void;
  caption: string;
  setCaption: (value: string) => void;
  headline: string;
}

export default function CreativeAndCaption({
  platform,
  creative,
  setCreative,
  caption = "",
  setCaption,
  headline = "",
}: CreativeAndCaptionProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("video/") ? "video" : "image";

    setCreative({ type, url });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Creative and Caption</h3>
      </div>

      {/* Upload Section */}
      <div className="space-y-4">
        {/* Header  */}
        {platform === "meta" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Meta Logo */}
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.5h-2.043c0 2.872-.315 4.375-2.851 4.375-1.569 0-2.063-.794-2.063-2.625V14.5H8.893v-2.5h2.044V9.625c0-2.25 1.156-3.625 3.375-3.625h2.25v2.5h-1.5c-1.125 0-1.219.375-1.219 1.125V12h2.719l-.375 2.5z" />
                </svg>
              </div>

              {/* Upload Text */}
              <div>
                {creative ? (
                  <p className="text-gray-700 font-medium">
                    {creative.type === "video"
                      ? "Upload video"
                      : headline || "Enter Header"}
                  </p>
                ) : (
                  <p className="text-gray-700 font-medium">Enter Header</p>
                )}
              </div>
            </div>

            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Creative Preview */}
        {creative ? (
          <div className="relative">
            {creative.type === "image" ? (
              <img
                src={creative.url}
                alt="Ad creative"
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <video
                src={creative.url}
                controls
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            {/* Change video/image link */}
            <button
              onClick={() =>
                document.getElementById("creative-upload")?.click()
              }
              className="mt-2 text-khaki-300 text-sm flex items-center gap-1 hover:text-khaki-400"
            >
              ✏️ Change {creative.type}
            </button>
          </div>
        ) : (
          /* Upload Button */
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-khaki-300 transition-colors cursor-pointer">
            <input
              id="creative-upload"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="creative-upload" className="cursor-pointer">
              <div className="text-gray-500 mb-2">
                <svg
                  className="w-12 h-12 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Click to upload image or video
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, MP4 up to 10MB
              </p>
            </label>
          </div>
        )}

        {/* Caption Textarea */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your ad caption here..."
            rows={8}
            className="w-full bg-transparent border-none focus:outline-none resize-none text-sm text-gray-700 leading-relaxed"
          />
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              {caption?.length || 0} characters
            </span>
            <span className="text-xs text-gray-400">
              Recommended: 125-150 characters
            </span>
          </div>
        </div>

        {platform === "meta" && (
          <div className="bg-khaki-200/10 p-3 flex items-center mt-4 rounded-lg">
            <ListIcon className="w-5 h-5 text-khaki-900 inline-block mr-4" />
            <div className="flex gap-2">
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <Type className="w-5 h-5" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <Bold className="w-5 h-5" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <Italic className="w-5 h-5" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <Underline className="w-5 h-5" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <Strikethrough className="w-5 h-5" />
              </button>
            </div>

            <span className="inline-flex ml-auto text-sm text-khaki-300">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Generate variable caption
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
