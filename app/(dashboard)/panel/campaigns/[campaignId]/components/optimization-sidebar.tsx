"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  X,
  AlertCircle,
  CheckCircle,
  SparklesIcon,
  BellIcon,
  SendHorizonalIcon,
} from "lucide-react";

interface OptimizationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OptimizationSidebar({
  isOpen,
  onClose,
}: OptimizationSidebarProps) {
  const optimizations = [
    {
      id: 1,
      title: "Audience can be better optimized",
      description: "2 changes discovered for Ad copy.",
      action: "See changes",
      hasRecommendation: true,
    },
    {
      id: 2,
      title: "Audience can be better optimized",
      description: "2 changes discovered for Ad copy.",
      action: "See changes",
      hasRecommendation: true,
    },
  ];

  return (
    <aside
      className={`fixed top-0 right-0 h-screen bg-linear-to-br  from-[#3a3a2a] via-[#3a3a2a]/70 to bg-khaki-200 text-white flex flex-col transition-all duration-300 z-50 ${
        isOpen ? "w-80 p-2" : "w-0"
      } overflow-hidden`}
    >
      {/* Header */}

      <div className="ml-auto p-4">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Optimization List */}
      <div className="p-6 space-y-4 bg-black/20 rounded-lg mx-4 ">
        <div className="overflow-y-auto hide-scrollbar">
          <div className="mb-4">
            <SparklesIcon className="w-5 h-5 text-khaki-200" fill="#ffe95c" />
          </div>

          <h1 className="mb-2">Optimize your campaign</h1>

          <div className="flex items-center gap-3 mb-6 bg-khaki-200/70 p-2 rounded-lg">
            <div className="bg-red-500 rounded-full p-1">
              <BellIcon className="w-4 h-4 text-gray-100" />
            </div>
            <p className="text-xs font-semibold text-gray-900">
              5 optimization opportunities located
            </p>
          </div>

          {optimizations.map((item) => (
            <div key={item.id} className="mb-3">
              <div className="flex items-start gap-3 ">
                <Checkbox
                  className="mt-1 w-5 h-5 bg-khaki-200 text-khaki-200"
                  checked={item.hasRecommendation}
                />
                <div className="">
                  <p className="text-xs">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                  <button className="text-xs text-khaki-200 hover:text-khaki-300 transition-colors">
                    {item.action}
                  </button>
                  {item.hasRecommendation && (
                    <p className="text-xs text-gray-500">Use recommendation</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Footer Actions */}
        <div className="pt-2 space-y-3">
          <button className="w-full bg-khaki-200 text-xs text-gray-900 font-semibold py-3 rounded-lg hover:bg-khaki-300 transition-colors">
            Implement all changes
          </button>
          <p className="text-red-500 text-center text-xs flex items-center justify-center gap-1">
            Discard optimization options
          </p>
        </div>
      </div>

      <div className="mt-auto border-gray-700">
        {/* Input Section */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="What would you like to optimize?"
              className="w-full bg-transparent border text-white placeholder-gray-300 px-4 py-6 pr-12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-khaki-200 text-wrap"
            />
            <button className="absolute right-2 top-1/2 text-black -translate-y-1/2 bg-white p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <SendHorizonalIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* Wizard Steps */}
        <div className="bg-black/20 p-4 mx-4 rounded-lg mb-2 space-y-3">
          <h2 className="text-khaki-200 font-semibold text-sm mb-4">
            Growdex Setup Wizard
          </h2>

          <div className="space-y-3">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              </div>
              <span className="text-xs text-gray-300">
                Create your first campaign
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              </div>
              <span className="text-xs text-gray-300">
                Connect your social accounts
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              </div>
              <span className="text-xs text-gray-300">Fund your ad wallet</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
