"use client";

import { useState } from "react";
import { Check, Plus, Sparkles, Infinity as InfinityIcon, ArrowRight } from "lucide-react";

interface ManualPlatformScreenProps {
  onConfirm?: (platforms: ("meta" | "tiktok")[]) => void;
}

interface Account {
  id: string;
  platform: "meta" | "tiktok";
  name: string;
  accountId: string;
  connected: boolean;
}

// Mock connected accounts (Meta + TikTok). Swap for real accounts later.
const ACCOUNTS: Account[] = [
  { id: "m1", platform: "meta", name: "Growdex Limited", accountId: "1234567889999999", connected: true },
  { id: "t1", platform: "tiktok", name: "Growdex Limited", accountId: "1234567889999999", connected: true },
  { id: "m2", platform: "meta", name: "Growdex Limited", accountId: "1234567889999999", connected: true },
  { id: "t2", platform: "tiktok", name: "Growdex Limited", accountId: "1234567889999999", connected: true },
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

function PlatformIcon({ platform }: { platform: Account["platform"] }) {
  if (platform === "meta") {
    return (
      <InfinityIcon className="w-6 h-6" style={{ color: "#0866FF" }} strokeWidth={2.5} />
    );
  }
  return <TikTokIcon className="w-5 h-5 text-gray-900" />;
}

export function ManualPlatformScreen({ onConfirm }: ManualPlatformScreenProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(ACCOUNTS.map((a) => [a.id, true])),
  );

  const toggle = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectedPlatforms = Array.from(
    new Set(
      ACCOUNTS.filter((a) => selected[a.id]).map((a) => a.platform),
    ),
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        What platforms are you running this ad on?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACCOUNTS.map((account) => {
          const isSelected = Boolean(selected[account.id]);
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => toggle(account.id)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                isSelected ? "border-khaki-300" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <CheckBox checked={isSelected} />
              <PlatformIcon platform={account.platform} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {account.name}
                </p>
                <p className="text-[11px] text-gray-400">
                  ID: {account.accountId}
                </p>
              </div>
              {account.connected && (
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

      {/* Optimisation banner */}
      <div className="mt-6 rounded-full bg-violet-50 px-4 py-2.5">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-500">
          <Sparkles className="w-3.5 h-3.5" />
          We&apos;ll optimise for each platform separately
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => onConfirm?.(selectedPlatforms)}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300 transition-colors"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-900">
          <ArrowRight className="w-3 h-3 text-white" />
        </span>
        Choose ad platform
      </button>
    </div>
  );
}

export default ManualPlatformScreen;
