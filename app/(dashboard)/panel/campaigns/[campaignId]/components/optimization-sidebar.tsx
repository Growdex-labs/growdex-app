"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[400px] bg-linear-to-br from-[#332C00] to-[#998400] text-white border-none">
        {/* Header */}
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-2 mt-4">
            <SparklesIcon className="w-5 h-5 text-khaki-200" fill="#ffe95c" />
          </div>
          <SheetTitle className="text-white text-xl">
            Optimize your campaign
          </SheetTitle>
          <div className="flex items-center gap-3 bg-khaki-200/70 p-3 rounded-lg">
            <div className="bg-red-500 rounded-full p-1.5">
              <BellIcon className="w-4 h-4 text-gray-100" />
            </div>
            <p className="text-sm font-semibold text-gray-900">
              5 optimization opportunities located
            </p>
          </div>
        </SheetHeader>

        {/* Optimization List */}
        <div className="flex-1 overflow-y-auto px-4 py-10 space-y-4 hide-scrollbar">
          {optimizations.map((item) => (
            <div key={item.id} className="bg-black/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  className="mt-1 w-5 h-5 bg-khaki-200 data-[state=checked]:bg-khaki-200 border-khaki-200"
                  checked={item.hasRecommendation}
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                  <button className="text-xs text-khaki-200 hover:text-khaki-300 transition-colors">
                    {item.action}
                  </button>
                  {item.hasRecommendation && (
                    <p className="text-xs text-gray-500 mt-1">
                      Use recommendation
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-4 space-y-3">
          <button className="w-full bg-khaki-200 text-gray-900 font-semibold py-3 rounded-lg hover:bg-khaki-300 transition-colors">
            Implement all changes
          </button>
          <button
            onClick={onClose}
            className="w-full text-red-700 text-sm font-medium hover:text-red-400 transition-colors"
          >
            Discard optimization options
          </button>
        </div>

        {/* Setup Wizard Section */}
        <SheetFooter className="border-t border-gray-700 mt-4 pt-4">
          <div className="w-full space-y-4">
            {/* Input Section */}
            <div className="relative">
              <input
                type="text"
                placeholder="What would you like to optimize?"
                className="w-full bg-transparent border border-gray-200 text-white placeholder-gray-400 px-4 py-4 pr-12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-khaki-200"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <SendHorizonalIcon className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Wizard Steps */}
            <div className="bg-black/20 p-4 rounded-lg space-y-3">
              <h2 className="text-khaki-200 font-semibold text-sm mb-3">
                Growdex Setup Wizard
              </h2>
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-500 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-300">
                    Create your first campaign
                  </span>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-500 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-300">
                    Connect your social accounts
                  </span>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-500 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-300">
                    Fund your ad wallet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
