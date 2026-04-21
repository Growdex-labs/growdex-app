"use client";

import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BudgetType } from "@/lib/campaigns";
import { addDaysDateInputValue, toDateInputValue } from "@/lib/campaign-shared";

interface BudgetSectionProps {
  progressTab: number;
  setProgressTab: (tab: number) => void;
  currency: string;
  setCurrency: (val: string) => void;
  CURRENCY_OPTIONS: string[];
  brandName: string;
  useSeparateBudgets: boolean;
  setUseSeparateBudgets: (val: boolean) => void;
  unifiedBudgetAmount: string;
  setUnifiedBudgetAmount: (val: string) => void;
  unifiedBudgetFrequency: "daily" | "lifetime";
  setUnifiedBudgetFrequency: (val: "daily" | "lifetime") => void;
  metaBudgetAmount: string;
  setMetaBudgetAmount: (val: string) => void;
  metaBudgetFrequency: "daily" | "lifetime";
  setMetaBudgetFrequency: (val: "daily" | "lifetime") => void;
  tiktokBudgetAmount: string;
  setTiktokBudgetAmount: (val: string) => void;
  tiktokBudgetFrequency: "daily" | "lifetime";
  setTiktokBudgetFrequency: (val: "daily" | "lifetime") => void;
  selectedPlatforms: {
    meta: boolean;
    tiktok: boolean;
  };
  readOnly?: boolean;
  useSchedule: boolean;
  setUseSchedule: (val: boolean) => void;
  scheduleStartDate: string;
  setScheduleStartDate: React.Dispatch<React.SetStateAction<string>>;
  scheduleEndDate: string;
  setScheduleEndDate: React.Dispatch<React.SetStateAction<string>>;
  scheduleTime: string;
  setScheduleTime: React.Dispatch<React.SetStateAction<string>>;
}

export const BudgetSection = ({
  progressTab,
  setProgressTab,
  currency,
  setCurrency,
  CURRENCY_OPTIONS,
  brandName,
  useSeparateBudgets,
  setUseSeparateBudgets,
  unifiedBudgetAmount,
  setUnifiedBudgetAmount,
  unifiedBudgetFrequency,
  setUnifiedBudgetFrequency,
  metaBudgetAmount,
  setMetaBudgetAmount,
  metaBudgetFrequency,
  setMetaBudgetFrequency,
  tiktokBudgetAmount,
  setTiktokBudgetAmount,
  tiktokBudgetFrequency,
  setTiktokBudgetFrequency,
  selectedPlatforms,
  readOnly = false,
  useSchedule,
  setUseSchedule,
  scheduleStartDate,
  setScheduleStartDate,
  scheduleEndDate,
  setScheduleEndDate,
  scheduleTime,
  setScheduleTime,
}: BudgetSectionProps) => {
  return (
    <div
      className={`bg-white rounded-xl p-4 border ${
        progressTab === 3 ? "border-darkkhaki-200" : "border-transparent"
      }`}
      onClick={() => setProgressTab(3)}
    >
      <div>
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
            <div className="w-0 h-full border border-peru-200" />
          </div>
          <div className="w-full">
            <label
              htmlFor="platform"
              className="block text-sm font-medium text-gray-800 font-gilroy-bold"
            >
              Budget & Schedule
            </label>
            <div className="flex items-center justify-between font-gilroy-medium">
              <p className="mt-2 text-gray-500">
                How much do you want to spend?
              </p>
              <p className="ml-2 hover:underline text-peru-200 cursor-pointer">
                Select Budget
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-gray-500">Currency</p>
              <div className="w-40">
                <Select
                  value={currency}
                  onValueChange={setCurrency}
                  disabled={readOnly}
                >
                  <SelectTrigger disabled={readOnly}>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Currency</SelectLabel>
                      {CURRENCY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Unified budget */}
            <div className="mt-4 bg-gray-50 p-2 rounded-xl">
              <div className="flex gap-2">
                <div className="mt-2 flex h-24 w-24 items-center justify-center rounded-lg bg-white">
                  <div className="relative h-8 w-8 flex items-center justify-center gap-3">
                    <img
                      src="/logos_meta-icon.png"
                      alt="meta"
                      className=" h-8 w-8"
                    />
                    <img
                      src="/logos_tiktok-icon.png"
                      alt="tiktok"
                      className="h-8 w-8"
                    />
                  </div>
                </div>

                <div className="flex-1 mb-3 mt-2">
                  <div className="flex items-center justify-between gap-2 text-sm font-medium text-gray-700">
                    <span>{brandName}</span>
                    {useSeparateBudgets ? (
                      <span className="text-xs text-gray-400">
                        Unified budget disabled
                      </span>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      name="unifiedBudgetAmount"
                      type="number"
                      min={0}
                      step={0.01}
                      value={unifiedBudgetAmount}
                      onChange={(e) => setUnifiedBudgetAmount(e.target.value)}
                      placeholder="Amount"
                      disabled={readOnly || useSeparateBudgets}
                    />

                    <Select
                      value={unifiedBudgetFrequency}
                      onValueChange={(v) =>
                        setUnifiedBudgetFrequency(v as "daily" | "lifetime")
                      }
                      disabled={readOnly || useSeparateBudgets}
                    >
                      <SelectTrigger disabled={readOnly || useSeparateBudgets}>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Frequency</SelectLabel>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="lifetime">Lifetime</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-gray-500">Reach: 25,000 - 70,000</p>
                </div>
              </div>
            </div>

            {/* Separate budget toggle */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Use separate budget amounts
              </span>

              <Switch
                checked={useSeparateBudgets}
                disabled={readOnly}
                className="data-[state=checked]:bg-khaki-200 data-[state=unchecked]:bg-gray-200 border border-peru-200"
                onCheckedChange={(checked) => {
                  const next = Boolean(checked);
                  setUseSeparateBudgets(next);

                  // When switching back to unified mode, prefill unified budget
                  // from the current split state (sum + reconciled frequency).
                  if (!next) {
                    const budgetAmountMeta = selectedPlatforms.meta
                      ? Number(metaBudgetAmount || 0)
                      : 0;
                    const budgetAmountTiktok = selectedPlatforms.tiktok
                      ? Number(tiktokBudgetAmount || 0)
                      : 0;
                    const splitAmount =
                      (Number.isFinite(budgetAmountMeta)
                        ? budgetAmountMeta
                        : 0) +
                      (Number.isFinite(budgetAmountTiktok)
                        ? budgetAmountTiktok
                        : 0);
                    setUnifiedBudgetAmount(
                      splitAmount ? String(splitAmount) : "",
                    );

                    const types: BudgetType[] = [];
                    if (selectedPlatforms.meta) types.push(metaBudgetFrequency);
                    if (selectedPlatforms.tiktok)
                      types.push(tiktokBudgetFrequency);
                    setUnifiedBudgetFrequency(
                      types.includes("lifetime") ? "lifetime" : "daily",
                    );
                  }
                }}
                aria-label="Use separate budget amounts"
              />
            </div>

            {/* Platform budgets */}
            <div
              className={`grid grid-cols-2 gap-2 mt-4 ${
                useSeparateBudgets ? "" : "opacity-50"
              }`}
              aria-disabled={!useSeparateBudgets}
            >
              {/* Meta Card */}
              <div className="inline-flex items-start gap-2 bg-gray-50 p-2 rounded-xl">
                {/* Meta Logo */}
                <img src="/logos_meta-icon.png" alt="meta" className="mt-2" />

                {/* Meta Freq */}
                <div className="mb-3 mt-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span>{brandName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      name="metaBudgetAmount"
                      type="number"
                      min={0}
                      step={0.01}
                      value={metaBudgetAmount}
                      onChange={(e) => setMetaBudgetAmount(e.target.value)}
                      placeholder="Amount"
                      disabled={readOnly || !useSeparateBudgets}
                    />
                    <Select
                      value={metaBudgetFrequency}
                      onValueChange={(v) =>
                        setMetaBudgetFrequency(v as "daily" | "lifetime")
                      }
                      disabled={readOnly || !useSeparateBudgets}
                    >
                      <SelectTrigger disabled={readOnly || !useSeparateBudgets}>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Frequency</SelectLabel>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="lifetime">Lifetime</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-gray-500">Reach: 25,000 - 70,000</p>
                </div>
              </div>
              <div className="inline-flex items-start gap-2 bg-gray-50 p-2 rounded-xl">
                {/* Tiktok Logo */}
                <img src="/logos_tiktok-icon.png" alt="meta" className="mt-2" />

                {/* Tiktok Freq */}
                <div className="mb-3 mt-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span>{brandName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      name="tiktokBudgetAmount"
                      type="number"
                      min={0}
                      step={0.01}
                      value={tiktokBudgetAmount}
                      onChange={(e) => setTiktokBudgetAmount(e.target.value)}
                      placeholder="Amount"
                      disabled={readOnly || !useSeparateBudgets}
                    />
                    <Select
                      value={tiktokBudgetFrequency}
                      onValueChange={(v) =>
                        setTiktokBudgetFrequency(v as "daily" | "lifetime")
                      }
                      disabled={readOnly || !useSeparateBudgets}
                    >
                      <SelectTrigger disabled={readOnly || !useSeparateBudgets}>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Frequency</SelectLabel>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="lifetime">Lifetime</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-gray-500">Reach: 25,000 - 70,000</p>
                </div>
              </div>
            </div>

            {/* Schedule toggle */}
              <div className="mt-2 flex items-center  gap-2 mb-2">
                <div>
                  <p className="text-sm font-medium font-gilroy-bold">
                    Schedule campaign for later date
                  </p>
                </div>

                <Switch
                  checked={useSchedule}
                  className="data-[state=checked]:bg-khaki-200 data-[state=unchecked]:bg-gray-200 border border-peru-200"
                  onCheckedChange={(checked) => {
                    const next = Boolean(checked);
                    setUseSchedule(next);

                    if (next) {
                      const today = new Date();
                      const start = toDateInputValue(today);
                      const end = addDaysDateInputValue(start, 7);
                      setScheduleStartDate((prev: string) => prev || start);
                      setScheduleEndDate((prev: string) => prev || end);
                      setScheduleTime((prev: string) => prev || "09:00");
                    }
                  }}
                  aria-label="Schedule campaign for later date"
                />
              </div>

              {useSchedule && (
                <div className="bg-white rounded-xl p-4 border border-darkkhaki-200 flex gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-dimYellow border border-peru-200" />
                    <div className="w-0 h-full border border-peru-200" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-800 font-gilroy-bold">
                      Schedule ad
                    </label>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <label htmlFor="start-date">
                        Start Date
                        <Input
                          type="date"
                          value={scheduleStartDate}
                          onChange={(e) => setScheduleStartDate(e.target.value)}
                          aria-label="Start date"
                        />
                      </label>
                      <label htmlFor="end-date">
                        End Date(optional)
                        <Input
                          type="date"
                          value={scheduleEndDate}
                          onChange={(e) => setScheduleEndDate(e.target.value)}
                          aria-label="End date"
                        />
                      </label>
                      <label htmlFor="time">
                        Time
                        <Input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="text-peru-200"
                          aria-label="Time"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
