"use client";

import { PencilIcon, PlusIcon, CheckIcon, UploadIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { mockCampaigns } from "@/lib/mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BudgetSplitSlider from "./budget-split-slider";

export default function CreateBudget() {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [budgetTitle, setBudgetTitle] = useState("Untitled Budget");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [pauseOnBudgetReached, setPauseOnBudgetReached] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (budgetTitle.trim() === "") {
      setBudgetTitle("Untitled Budget");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
      setBudgetTitle(budgetTitle || "Untitled Budget");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg flex flex-col">
      <div className="bg-slate-100 p-3 flex rounded-lg items-center mb-4">
        <PlusIcon className="size-7 rounded-full bg-slate-300 text-gray-900 mr-3" />
        <div className="flex gap-2 items-center flex-1">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={budgetTitle}
                onChange={(e) => setBudgetTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleKeyDown}
                className="text-gray-800 text-2xl font-semibold bg-white border border-khaki-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-khaki-300"
              />
              <CheckIcon
                className="w-5 h-5 text-green-600 cursor-pointer"
                onClick={handleTitleSave}
              />
            </div>
          ) : (
            <>
              <h3 className="text-gray-800 text-2xl font-semibold">
                {budgetTitle}
              </h3>
              <PencilIcon
                className="w-4 h-4 ml-px text-[#D6C34A] cursor-pointer hover:text-[#c5b13a] transition-colors"
                onClick={handleTitleEdit}
              />
            </>
          )}
        </div>
      </div>

      <div className="mb-6 mt-2">
        <h3 className="mb-2">Select a campaign for this budget</h3>
        <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Choose a campaign" />
          </SelectTrigger>
          <SelectContent>
            {mockCampaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                <div className="flex items-center gap-2">
                  <span>{campaign.name}</span>
                  <span className="text-xs text-gray-500">
                    ({campaign.status})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget Split Slider - Only show when campaign is selected */}
      {selectedCampaign && (
        <BudgetSplitSlider
          totalAmount={135000}
          walletBalance={30000000}
          platforms={[
            { id: "facebook", name: "Facebook", icon: "facebook" },
            { id: "instagram", name: "Instagram", icon: "instagram" },
          ]}
        />
      )}

      <div className="space-y-3 mt-6">
        <h3 className="text-sm font-medium">How much do you want to use?</h3>
        <div className="flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Meta Platform */}
          <div className="bg-slate-100 p-4 rounded-lg flex items-start gap-3 sm:flex-1">
            {/* Meta logo */}
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>

            {/* Input Section */}
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-2">Growdex Limited</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="₦5,000"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-khaki-300"
                />
                <Select defaultValue="daily">
                  <SelectTrigger className="w-24 bg-transparent flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-xs text-gray-500">
                Reach 25,000 - 70,000
              </span>
            </div>
          </div>

          {/* TikTok Platform */}
          <div className="bg-slate-100 p-4 rounded-lg flex items-start gap-3 sm:flex-1">
            {/* TikTok logo */}
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </div>

            {/* Input Section */}
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-2">Grow with Growdex</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="₦5,000"
                  className="sm:flex-1 border border-gray-300 rounded-md px-2 sm:px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-khaki-300"
                />
                <Select defaultValue="daily">
                  <SelectTrigger className="w-24 bg-transparent flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-xs text-gray-500">
                Reach 25,000 - 70,000
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 mb-4">
        <span className="text-sm font-medium text-gray-700">
          Pause campaign after budget is reached
        </span>
        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={pauseOnBudgetReached}
          onClick={() => setPauseOnBudgetReached(!pauseOnBudgetReached)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            pauseOnBudgetReached ? "bg-khaki-300" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              pauseOnBudgetReached ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <button className="mt-4 bg-khaki-200 w-full py-2 rounded-md text-sm font-semibold flex items-center justify-center hover:bg-khaki-300 transition-colors">
        <UploadIcon className="w-4 h-4 mr-2" />
        Create Budget
      </button>
    </div>
  );
}
