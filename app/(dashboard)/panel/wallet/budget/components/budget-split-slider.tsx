"use client";

import { useState, useEffect } from "react";
import { Facebook, Instagram } from "lucide-react";

interface BudgetSplitSliderProps {
  totalAmount: number;
  walletBalance: number;
  platforms: {
    id: string;
    name: string;
    icon: "facebook" | "instagram";
  }[];
}

export default function BudgetSplitSlider({
  totalAmount,
  walletBalance,
  platforms,
}: BudgetSplitSliderProps) {
  const [amount, setAmount] = useState(totalAmount.toString());
  const [splitPercentage, setSplitPercentage] = useState(50); // Default 50/50 split

  const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const isValidAmount = numericAmount > 0 && numericAmount <= walletBalance;

  // Calculate split amounts for two platforms
  const platform1Amount = (numericAmount * splitPercentage) / 100;
  const platform2Amount = (numericAmount * (100 - splitPercentage)) / 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: string) => {
    const num = value.replace(/,/g, "");
    if (isNaN(Number(num))) return amount;
    return Number(num).toLocaleString("en-US");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (rawValue === "" || /^\d+$/.test(rawValue)) {
      setAmount(rawValue);
    }
  };

  const handleAmountBlur = () => {
    if (amount) {
      setAmount(formatNumber(amount));
    }
  };

  const getPlatformIcon = (iconType: "facebook" | "instagram") => {
    switch (iconType) {
      case "facebook":
        return <Facebook className="w-4 h-4  text-blue-600" />;
      case "instagram":
        return <Instagram className="w-4 h-4 text-pink-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-dimYellow/70 border border-yellow-200 rounded-lg p-4 md:p-6 space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
          <span className="text-xs text-white">ℹ</span>
        </div>
        <h4 className="text-sm md:text-base font-medium text-gray-700">
          Split funds
        </h4>
      </div>

      {/* Amount Input */}
      <div>
        <label className="text-xs md:text-sm text-gray-600 mb-1 block">
          Enter amount less than wallet balance
        </label>
        <input
          type="text"
          value={amount ? `N${amount}` : ""}
          onChange={handleAmountChange}
          onBlur={handleAmountBlur}
          placeholder="N0"
          className={`w-full text-xl md:text-2xl font-semibold px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 ${
            amount && !isValidAmount
              ? "border-red-300 bg-red-50 focus:ring-red-200"
              : "border-gray-200 bg-white focus:ring-khaki-300"
          }`}
        />
        {amount && !isValidAmount && (
          <p className="text-xs text-red-600 mt-1">
            {numericAmount > walletBalance
              ? `Amount exceeds wallet balance (${formatCurrency(
                  walletBalance
                )})`
              : "Please enter a valid amount"}
          </p>
        )}
      </div>

      {/* Slider Section */}
      {isValidAmount && platforms.length === 2 && (
        <div className="space-y-4 mt-5">
          {/* Slider with Platform Icons on both ends */}
          <div className="flex items-center gap-3">
            {/* Left Platform Icon */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="flex flex-col items-center gap-1">
                {getPlatformIcon(platforms[0].icon)}
                <span className="text-xs md:text-sm font-semibold text-gray-700">
                  {formatCurrency(platform1Amount)}
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="relative flex-1 py-2">
              <input
                type="range"
                min="0"
                max="100"
                value={splitPercentage}
                onChange={(e) => setSplitPercentage(Number(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-khaki-300 slider"
                style={{
                  background: `linear-gradient(to right, #6B7280 0%, #6B7280 ${splitPercentage}%, #D1D5DB ${splitPercentage}%, #D1D5DB 100%)`,
                }}
              />
            </div>

            {/* Right Platform Icon */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="flex flex-col items-center gap-1">
                {getPlatformIcon(platforms[1].icon)}
                <span className="text-xs md:text-sm font-semibold text-gray-700">
                  {formatCurrency(platform2Amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Distribution */}
          <div className="flex items-center justify-between text-sm">
            <div className="bg-gray-600 text-white rounded-full px-8  font-semibold">
              {splitPercentage}%
            </div>
            <div className="bg-gray-600 text-white rounded-full px-8   font-semibold">
              {100 - splitPercentage}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
