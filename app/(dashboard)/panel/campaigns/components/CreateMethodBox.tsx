"use client";

import { GradientSparkle } from "./GradientSparkle";

export type CreationMethod = "manual" | "ai";

interface CreateMethodBoxProps {
  value: CreationMethod | null;
  onSelect: (method: CreationMethod) => void;
}

export function CreateMethodBox({ value, onSelect }: CreateMethodBoxProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-6">
        How do you want to create your campaign?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Manual */}
        <button
          type="button"
          onClick={() => onSelect("manual")}
          aria-pressed={value === "manual"}
          className={`group flex flex-col items-center justify-center text-center rounded-xl border p-8 min-h-[220px] transition-all ${
            value === "manual"
              ? "border-khaki-300 ring-2 ring-khaki-200 bg-dimYellow/30"
              : "border-gray-200 hover:border-khaki-300 hover:bg-gray-50"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-khaki-200 flex items-center justify-center mb-5">
            <img src="/megaphone.png" alt="" className="w-8 h-8" />
          </div>
          <span className="text-xs font-medium text-gray-400 mb-1">
            Manual setup
          </span>
          <span className="text-xl font-semibold text-gray-900">
            Build it myself
          </span>
        </button>

        {/* AI */}
        <button
          type="button"
          onClick={() => onSelect("ai")}
          aria-pressed={value === "ai"}
          className={`group flex flex-col items-center justify-center text-center rounded-xl border p-8 min-h-[220px] transition-all ${
            value === "ai"
              ? "border-violet-300 ring-2 ring-violet-200 bg-violet-50"
              : "border-gray-200 hover:border-violet-300 hover:bg-gray-50"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-5">
            <GradientSparkle className="w-8 h-8" />
          </div>
          <span className="text-xs font-medium text-violet-500 mb-1">
            AI-assisted
          </span>
          <span className="text-xl font-semibold text-gray-900">
            Create with AI
          </span>
        </button>
      </div>
    </div>
  );
}

export default CreateMethodBox;
