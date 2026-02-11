"use client";

import React from "react";
import { MoreVertical } from "lucide-react";

interface MetaAdPreviewProps {
  brandName: string;
  brandLogo: string;
  caption: string;
  creative: { type: "image" | "video"; url: string } | null;
  headline: string;
  callToAction?: string;
}

export function MetaAdPreview({
  brandName = "Your Brand",
  brandLogo = "/logo.png",
  caption = "",
  creative = null,
  headline = "",
  callToAction = "Join in now",
}: MetaAdPreviewProps) {
  return (
    <div className="bg-gray-100 p-4 rounded-xl">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Preview</h3>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {/* Brand Logo */}
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.5h-2.043c0 2.872-.315 4.375-2.851 4.375-1.569 0-2.063-.794-2.063-2.625V14.5H8.893v-2.5h2.044V9.625c0-2.25 1.156-3.625 3.375-3.625h2.25v2.5h-1.5c-1.125 0-1.219.375-1.219 1.125V12h2.719l-.375 2.5z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{brandName}</p>
              <p className="text-xs text-gray-500">Sponsored</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Caption (truncated) */}
        <div className="px-4 pb-3">
          <p className="text-gray-700 text-sm line-clamp-2">
            {caption ||
              "We'd love to hear from you.\nWhether you have questions about upcoming events, ..."}
          </p>
        </div>

        {/* Creative (Image/Video) */}
        {creative ? (
          <div className="w-full bg-gray-100">
            {creative.type === "image" ? (
              <img
                src={creative.url}
                alt="Ad creative"
                className="w-full h-auto object-cover"
              />
            ) : (
              <video
                src={creative.url}
                className="w-full h-auto object-cover"
                controls
                playsInline
              />
            )}
          </div>
        ) : (
          /* Placeholder when no creative */
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">No image uploaded</p>
            </div>
          </div>
        )}

        {/* Headline + CTA */}
        <div className="p-4 border-t border-gray-100">
          <p className="font-semibold text-gray-900 mb-3 text-sm">
            {headline || "5,000 things you need to be successful"}
          </p>
          <button className="w-full bg-khaki-200 text-gray-900 font-semibold py-2.5 px-4 rounded-lg hover:bg-khaki-300 transition-colors text-sm">
            {callToAction}
          </button>
        </div>
      </div>
    </div>
  );
}
