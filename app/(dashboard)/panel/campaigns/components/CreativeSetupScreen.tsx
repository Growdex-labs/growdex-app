"use client";

import { useState, type ReactNode } from "react";
import {
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  UploadCloud,
  Upload,
  GalleryHorizontal,
  MoreVertical,
  Check,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface CreativeSetupScreenProps {
  /** The stepper element, rendered above the screen. */
  stepper: ReactNode;
  onSetupAd?: (selectedAssetIds: string[]) => void;
}

interface Asset {
  id: string;
  name: string;
  url: string;
}

// Mock asset library with random (but stable) images from Lorem Picsum.
// Swap for the real asset library later.
const MOCK_ASSETS: Asset[] = Array.from({ length: 12 }, (_, i) => ({
  id: `asset-${i + 1}`,
  name: "Untitled img.png",
  url: `https://picsum.photos/seed/growdex-${i + 1}/320/240`,
}));

const FILTERS = ["Type", "People", "Modified"];

export function CreativeSetupScreen({
  stepper,
  onSetupAd,
}: CreativeSetupScreenProps) {
  // The step walks through: connect platform -> upload options -> asset library.
  const [stage, setStage] = useState<"connect" | "upload" | "library">(
    "connect",
  );
  const [tab, setTab] = useState<"posts" | "assets">("assets");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Record<string, boolean>>({
    "asset-1": true,
  });
  const [sameForAll, setSameForAll] = useState(true);

  const selectedIds = MOCK_ASSETS.filter((a) => selected[a.id]).map(
    (a) => a.id,
  );

  const toggleAsset = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleSelectAll = () => {
    if (selectedIds.length === MOCK_ASSETS.length) {
      setSelected({});
    } else {
      setSelected(Object.fromEntries(MOCK_ASSETS.map((a) => [a.id, true])));
    }
  };

  return (
    <>
      <div className="mb-8">{stepper}</div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Setup your ad creatives
          </h2>

          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-200"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["posts", "assets"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm capitalize transition-colors ${
                  tab === t
                    ? "bg-khaki-200 font-medium text-gray-900"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar (upload + library stages) */}
        {stage !== "connect" && (
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100">
          {stage === "library" ? (
            <>
              <span className="text-sm text-gray-700">
                {selectedIds.length} Selected
              </span>
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === MOCK_ASSETS.length}
                  onChange={toggleSelectAll}
                  className="accent-khaki-300"
                />
                Select all
              </label>
            </>
          ) : (
            <span className="text-sm text-gray-700">0 Assets</span>
          )}

          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              {filter}
              <ChevronDown className="w-3 h-3" />
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center rounded-md border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`p-1.5 ${view === "grid" ? "bg-gray-100 text-gray-800" : "text-gray-400"}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`p-1.5 ${view === "list" ? "bg-gray-100 text-gray-800" : "text-gray-400"}`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {stage === "library" && (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
              >
                <UploadCloud className="w-4 h-4" />
                Upload
              </button>
            )}
          </div>
        </div>
        )}

        {/* Body */}
        {stage === "connect" ? (
          <div className="p-5">
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 py-24 flex flex-col items-center justify-center text-center">
              <GalleryHorizontal className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-500 mb-4">
                Connect your ad platform to see posts from your account
              </p>
              <button
                type="button"
                onClick={() => setStage("upload")}
                className="rounded-lg bg-khaki-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-khaki-300 transition-colors"
              >
                Connect ad platform
              </button>
            </div>
          </div>
        ) : stage === "upload" ? (
          <div className="p-5">
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 py-20 flex flex-col items-center justify-center text-center">
              <Upload className="w-11 h-11 text-gray-400 mb-4" />
              <p className="text-sm text-gray-500 mb-4">
                Upload an asset in your asset library or upload from your
                computer
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setStage("library")}
                  className="rounded-lg bg-khaki-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-khaki-300 transition-colors"
                >
                  Upload from computer
                </button>
                <button
                  type="button"
                  onClick={() => setStage("library")}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Go to Asset library
                </button>
              </div>
            </div>
          </div>
        ) : (
        <div className="max-h-[460px] overflow-y-auto p-5 rounded-b-2xl">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {MOCK_ASSETS.map((asset) => {
              const isSelected = Boolean(selected[asset.id]);
              return (
                <div key={asset.id}>
                  <button
                    type="button"
                    onClick={() => toggleAsset(asset.id)}
                    className={`relative w-full aspect-4/3 rounded-xl border-2 overflow-hidden bg-gray-100 flex items-center justify-center transition-colors ${
                      isSelected ? "border-khaki-300" : "border-transparent"
                    }`}
                  >
                    <img
                      src={asset.url}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-2 left-2 flex items-center justify-center w-5 h-5 rounded-md border ${
                        isSelected
                          ? "bg-khaki-200 border-khaki-300"
                          : "bg-white/80 border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3 h-3 text-gray-900" />
                      )}
                    </span>
                  </button>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-xs text-gray-600 truncate">
                      {asset.name}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 text-gray-400 hover:text-gray-600"
                      aria-label="Asset options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>

      {/* Footer — library stage only */}
      {stage === "library" && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 p-3 bg-white rounded-2xl text-sm text-gray-600">
            Use the same creative for all platforms
            <Switch
              checked={sameForAll}
              onCheckedChange={setSameForAll}
              className="data-[state=checked]:bg-khaki-300"
            />
          </label>

          <button
            type="button"
            onClick={() => onSetupAd?.(selectedIds)}
            className="rounded-lg bg-khaki-200 px-6 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300 transition-colors"
          >
            Setup ad
          </button>
        </div>
      )}
    </>
  );
}

export default CreativeSetupScreen;
