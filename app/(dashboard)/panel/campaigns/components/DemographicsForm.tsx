"use client";

import { useState } from "react";
import {
  X,
  Check,
  ChevronDown,
  Sparkles,
  Search,
  ArrowRight,
  Smartphone,
  Monitor,
  Tablet,
  Infinity as InfinityIcon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

function TikTokNote({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const DEVICES = [
  { id: "mobile", label: "Mobile", Icon: Smartphone },
  { id: "web", label: "Web", Icon: Monitor },
  { id: "tablet", label: "Tablet", Icon: Tablet },
];

const TABS = [
  "Demographics",
  "Audiences",
  "Interests",
  "Device",
  "Budget",
  "Advanced",
];

const DEFAULT_AGE_OPTIONS = [
  "13-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+",
];

interface DemographicsFormProps {
  ageOptions?: string[];
  initialSelectedAges?: string[];
  /** Show the location search field + "Change country" link. */
  showLocationSearch?: boolean;
  /** When set, a Next button walks through the tabs, then calls this on the last. */
  onNext?: () => void;
  /** Notified whenever the active tab changes (so the parent can retitle). */
  onTabChange?: (tab: string) => void;
}

export function DemographicsForm({
  ageOptions = DEFAULT_AGE_OPTIONS,
  initialSelectedAges = ["35-44", "45-54"],
  showLocationSearch = false,
  onNext,
  onTabChange,
}: DemographicsFormProps) {
  const [activeTab, setActiveTab] = useState("Demographics");
  const [separateBudget, setSeparateBudget] = useState(false);

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const tabIndex = TABS.indexOf(activeTab);
  const goNext = () => {
    if (tabIndex < TABS.length - 1) changeTab(TABS[tabIndex + 1]);
    else onNext?.();
  };
  const [locations, setLocations] = useState([
    "Makurdi",
    "Asokoro",
    "Asokoro",
    "Asokoro",
  ]);
  const [ages, setAges] = useState<Record<string, boolean>>(
    Object.fromEntries(initialSelectedAges.map((a) => [a, true])),
  );
  const [gender, setGender] = useState<"all" | "male" | "female">("all");
  const [interests, setInterests] = useState([
    "Marketing",
    "Management",
    "Asokoro",
    "Movies and TV",
  ]);

  const [devices, setDevices] = useState<Record<string, boolean>>({
    tablet: true,
  });

  const removeInterest = (index: number) =>
    setInterests((prev) => prev.filter((_, i) => i !== index));

  const toggleDevice = (id: string) =>
    setDevices((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleAge = (age: string) =>
    setAges((prev) => ({ ...prev, [age]: !prev[age] }));

  const removeLocation = (index: number) =>
    setLocations((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-6">
      {/* Vertical tabs */}
      <div className="flex flex-col gap-1">
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => changeTab(tab)}
              className={`text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "border border-gray-300 font-medium text-gray-900"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Fields */}
      <div className="space-y-5">
        {activeTab === "Demographics" && (
          <>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Location</label>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-800">
              <span>🇳🇬</span> Nigeria
            </div>
            {showLocationSearch && (
              <button
                type="button"
                className="text-xs text-violet-500 hover:text-violet-600"
              >
                Change country
              </button>
            )}
          </div>

          {showLocationSearch && (
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for locations in Nigeria"
                className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-200"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {locations.map((loc, i) => (
              <span
                key={`${loc}-${i}`}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600"
              >
                <button
                  type="button"
                  onClick={() => removeLocation(i)}
                  aria-label={`Remove ${loc}`}
                >
                  <X className="w-3 h-3" />
                </button>
                {loc}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-violet-500 hover:text-violet-600"
          >
            <Sparkles className="w-3 h-3" />
            Optimize your audience to match your goals
          </button>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Age</label>
          <div className="flex flex-wrap gap-3">
            {ageOptions.map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => toggleAge(age)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  ages[age] ? "border-khaki-300" : "border-gray-200"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded border ${
                    ages[age]
                      ? "bg-khaki-200 border-khaki-300"
                      : "border-gray-300"
                  }`}
                >
                  {ages[age] && <Check className="w-3 h-3 text-gray-900" />}
                </span>
                {age}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Gender</label>
          <div className="flex gap-3">
            {(["all", "male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm capitalize ${
                  gender === g ? "border-khaki-300" : "border-gray-200"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded border ${
                    gender === g
                      ? "bg-khaki-200 border-khaki-300"
                      : "border-gray-300"
                  }`}
                >
                  {gender === g && <Check className="w-3 h-3 text-gray-900" />}
                </span>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Language</label>
          <div className="relative max-w-xs">
            <select className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none">
              <option>English</option>
              <option>French</option>
              <option>Spanish</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
          </>
        )}

        {activeTab === "Audiences" && (
          <>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Include audience{" "}
                <span className="text-xs text-gray-400">optional</span>
              </label>
              <div className="relative max-w-md">
                <select
                  defaultValue=""
                  className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-500 focus:outline-none"
                >
                  <option value="">Select audience</option>
                  <option>Lookalike – Website visitors</option>
                  <option>Engaged shoppers</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Exclude audience{" "}
                <span className="text-xs text-gray-400">optional</span>
              </label>
              <div className="relative max-w-md">
                <select
                  defaultValue=""
                  className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-500 focus:outline-none"
                >
                  <option value="">Select audience</option>
                  <option>Existing customers</option>
                  <option>Recent purchasers</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <button
              type="button"
              className="text-sm font-medium text-[#B8A247] hover:opacity-80"
            >
              Create custom audience
            </button>
          </>
        )}

        {activeTab === "Interests" && (
          <>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Core Interest Categories
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for audience interest"
                  className="w-full rounded-full border border-gray-200 pl-9 pr-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-200"
                />
              </div>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-violet-500 hover:text-violet-600"
              >
                <Sparkles className="w-3 h-3" />
                Generate interests optimized for your demographics and audience
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {interests.map((interest, i) => (
                <span
                  key={`${interest}-${i}`}
                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                >
                  <button
                    type="button"
                    onClick={() => removeInterest(i)}
                    aria-label={`Remove ${interest}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {interest}
                </span>
              ))}
            </div>
          </>
        )}

        {activeTab === "Device" && (
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Preferred traffic from
            </label>
            <div className="flex flex-wrap gap-3">
              {DEVICES.map(({ id, label, Icon }) => {
                const selected = Boolean(devices[id]);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleDevice(id)}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm min-w-[140px] transition-colors ${
                      selected
                        ? "border-khaki-300 bg-dimYellow/40 text-gray-900"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "Budget" && (
          <>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Setup your budget
              </label>
              <div className="flex items-center rounded-lg border border-gray-200 px-3 py-2.5 max-w-sm">
                <span className="text-sm text-gray-500 mr-1">₦</span>
                <input
                  type="text"
                  defaultValue="5,000.00"
                  className="flex-1 min-w-0 text-sm font-semibold text-gray-900 focus:outline-none"
                />
                <div className="relative">
                  <select className="appearance-none bg-transparent pr-4 text-xs text-gray-500 focus:outline-none">
                    <option>Daily</option>
                    <option>Lifetime</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                </div>
              </div>
              <p className="mt-1 text-xs font-medium text-red-500">
                Increase your budget to a minimum of ₦6,000.00
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              Use separate budget amounts
              <Switch
                checked={separateBudget}
                onCheckedChange={setSeparateBudget}
                className="data-[state=checked]:bg-khaki-300"
              />
            </label>

            <div
              className={`space-y-3 transition-opacity ${
                separateBudget ? "" : "opacity-50 pointer-events-none"
              }`}
            >
              {[
                { id: "tiktok", Icon: TikTokNote },
                { id: "meta", Icon: InfinityIcon },
              ].map(({ id, Icon }) => (
                <div
                  key={id}
                  className="flex items-center rounded-lg border border-gray-200 px-3 py-2.5 max-w-sm"
                >
                  <Icon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-400 mr-1">₦</span>
                  <input
                    type="text"
                    defaultValue="5,000.00"
                    className="flex-1 min-w-0 text-sm font-semibold text-gray-500 focus:outline-none"
                  />
                  <div className="relative">
                    <select className="appearance-none bg-transparent pr-4 text-xs text-gray-400 focus:outline-none">
                      <option>Daily</option>
                      <option>Lifetime</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "Advanced" && (
          <p className="text-sm text-gray-400">Coming soon.</p>
        )}

        {onNext && (
          <div>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-lg bg-khaki-200 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-khaki-300 transition-colors"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-900">
                <ArrowRight className="w-3 h-3 text-white" />
              </span>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DemographicsForm;
