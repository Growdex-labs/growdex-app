"use client";

import { useState } from "react";
import { Check, Plus, Search, ArrowRight, Infinity as InfinityIcon } from "lucide-react";

interface ManualEventScreenProps {
  onConfirm?: () => void;
}

interface DataSource {
  id: string;
  platform: "meta" | "tiktok";
  name: string;
  accountId: string;
  connected: boolean;
}

// Mock connected data sources. Swap for real data later.
const DATA_SOURCES: DataSource[] = [
  { id: "meta", platform: "meta", name: "Growdex Limited", accountId: "1234567889999999", connected: true },
  { id: "tiktok", platform: "tiktok", name: "Growdex Limited", accountId: "1234567889999999", connected: true },
];

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`shrink-0 flex items-center justify-center w-5 h-5 rounded border ${
        checked ? "bg-khaki-200 border-khaki-300" : "bg-white border-gray-300"
      }`}
    >
      {checked && <Check className="w-3 h-3 text-gray-900" />}
    </span>
  );
}

function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function PlatformIcon({ platform }: { platform: DataSource["platform"] }) {
  if (platform === "meta") {
    return (
      <InfinityIcon className="w-6 h-6" style={{ color: "#0866FF" }} strokeWidth={2.5} />
    );
  }
  return <TikTokIcon className="w-5 h-5 text-gray-900" />;
}

export function ManualEventScreen({ onConfirm }: ManualEventScreenProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(DATA_SOURCES.map((d) => [d.id, true])),
  );

  const toggle = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-5">
        Setup event management for your ad
      </h2>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search for data sources"
          className="w-full rounded-full border border-gray-200 pl-9 pr-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-200"
        />
      </div>

      {/* Data sources */}
      <div className="space-y-3">
        {DATA_SOURCES.map((source) => {
          const isSelected = Boolean(selected[source.id]);
          return (
            <button
              key={source.id}
              type="button"
              onClick={() => toggle(source.id)}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                isSelected ? "border-khaki-300" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <CheckBox checked={isSelected} />
              <PlatformIcon platform={source.platform} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {source.name}
                </p>
                <p className="text-[11px] text-gray-400">ID: {source.accountId}</p>
              </div>
              {source.connected && (
                <span className="shrink-0 w-2 h-2 rounded-full bg-green-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Add account */}
      <button
        type="button"
        className="mt-4 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded border border-gray-300">
          <Plus className="w-3 h-3" />
        </span>
        Add on account
      </button>

      {/* CTA */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300 transition-colors"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-900">
            <ArrowRight className="w-3 h-3 text-white" />
          </span>
          Choose ad platform
        </button>
      </div>
    </div>
  );
}

export default ManualEventScreen;
