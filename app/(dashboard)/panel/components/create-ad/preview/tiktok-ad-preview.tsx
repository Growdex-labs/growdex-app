"use client";

import React from "react";

interface TikTokAdPreviewProps {
  username: string;
  caption: string;
  creative: { type: "image" | "video"; url: string } | null;
  profilePic: string;
}

export function TikTokAdPreview({
  username = "@growdex",
  caption = "",
  creative = null,
  profilePic = "/logo.png",
}: TikTokAdPreviewProps) {
  return (
    <div className="bg-gray-100 p-4 rounded-xl">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Preview</h3>

      <div className="bg-black rounded-xl overflow-hidden aspect-9/16 max-h-[600px] relative shadow-xl">
        {/* Background Content */}
        {creative ? (
          <div className="absolute inset-0">
            {creative.type === "image" ? (
              <img
                src={creative.url}
                alt="TikTok ad"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={creative.url}
                className="w-full h-full object-cover"
                loop
                muted
                autoPlay
                playsInline
              />
            )}
          </div>
        ) : (
          /* Placeholder */
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">No video uploaded</p>
            </div>
          </div>
        )}

        {/* Overlay UI */}
        <div className="absolute inset-0">
          {/* Top Tabs */}
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-6 text-white z-10">
            <span className="text-sm font-medium opacity-70">Following</span>
            <span className="text-sm font-bold border-b-2 border-white pb-1">
              For You
            </span>
          </div>

          {/* Right Side Buttons */}
          <div className="absolute right-3 bottom-24 flex flex-col gap-5 items-center z-10">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-blue-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.5h-2.043c0 2.872-.315 4.375-2.851 4.375-1.569 0-2.063-.794-2.063-2.625V14.5H8.893v-2.5h2.044V9.625c0-2.25 1.156-3.625 3.375-3.625h2.25v2.5h-1.5c-1.125 0-1.219.375-1.219 1.125V12h2.719l-.375 2.5z" />
                </svg>
              </div>
              <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                +
              </div>
            </div>

            {/* Like Button */}
            <button className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <span className="text-white text-xs font-semibold">74.5k</span>
            </button>

            {/* Comment Button */}
            <button className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
              <span className="text-white text-xs font-semibold">1,234</span>
            </button>

            {/* Share Button */}
            <button className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                </svg>
              </div>
              <span className="text-white text-xs font-semibold">Share</span>
            </button>

            {/* More Button */}
            <button className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </div>
            </button>

            {/* Spinning Record */}
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-500 to-yellow-500 animate-spin-slow flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-black"></div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-20 left-3 right-16 text-white z-10">
            <p className="font-semibold text-sm mb-1">{username}</p>
            <p className="text-xs mb-2 line-clamp-2">
              {caption ||
                "Transform Your Business in 2025 🚀\n\n#BusinessGrowth #Marketing #Success"}
            </p>
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
              <span className="text-xs">Song name</span>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-black bg-opacity-90 flex items-center justify-around px-4 z-10">
            <button className="flex flex-col items-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              <span className="text-white text-xs mt-0.5">Home</span>
            </button>
            <button className="flex flex-col items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <span className="text-gray-400 text-xs mt-0.5">Discover</span>
            </button>
            <button className="relative">
              <div className="w-12 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">+</span>
              </div>
            </button>
            <button className="flex flex-col items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
              </svg>
              <span className="text-gray-400 text-xs mt-0.5">Inbox</span>
            </button>
            <button className="flex flex-col items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span className="text-gray-400 text-xs mt-0.5">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
