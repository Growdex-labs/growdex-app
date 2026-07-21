"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AudienceStrategy } from "@/lib/campaigns";

type CampaignBudget = AudienceStrategy["budget"];

interface CampaignBudgetEditorProps {
  budget: CampaignBudget;
  onChange: (next: Partial<CampaignBudget>) => void;
  accountRules?: {
    timezoneName: string;
    minimumDailyBudget: number;
  };
}

const localDatePart = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

const localTimePart = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(11, 16);
};

const mergeLocalDateTime = (datePart: string, timePart: string) => {
  if (!datePart || !timePart) return undefined;
  const date = new Date(`${datePart}T${timePart}`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const currencySymbol = (currency: CampaignBudget["currency"]) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency;

export function CampaignBudgetEditor({
  budget,
  onChange,
  accountRules,
}: CampaignBudgetEditorProps) {
  const startDate = localDatePart(budget.startDate);
  const startTime = localTimePart(budget.startDate) || "09:00";
  const endDate = localDatePart(budget.endDate);
  const endTime = localTimePart(budget.endDate) || startTime;

  const updateStart = (datePart: string, timePart: string) => {
    const value = mergeLocalDateTime(datePart, timePart);
    if (value) onChange({ startDate: value });
  };

  const updateEnd = (datePart: string, timePart: string) => {
    const value = mergeLocalDateTime(datePart, timePart);
    if (value) onChange({ endDate: value });
  };

  const enableEndDate = () => {
    const start = new Date(budget.startDate);
    const end = Number.isNaN(start.getTime()) ? new Date() : new Date(start);
    end.setDate(end.getDate() + 7);
    onChange({ endDate: end.toISOString() });
  };

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-900">Budget</h4>
      <div className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,1fr)]">
        <div>
          <label
            htmlFor="aiBudgetAmount"
            className="text-base font-medium text-gray-800"
          >
            Setup your budget
          </label>
          <div className="mt-3 flex min-h-14 items-center overflow-hidden rounded-xl border border-gray-300 bg-white focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100">
            <span className="pl-4 text-base font-semibold text-gray-500">
              {currencySymbol(budget.currency)}
            </span>
            <Input
              id="aiBudgetAmount"
              type="number"
              min={accountRules?.minimumDailyBudget ?? 0.01}
              step="0.01"
              value={budget.amount || ""}
              onChange={(event) =>
                onChange({ amount: Number(event.target.value) })
              }
              className="h-14 min-w-0 flex-1 border-0 px-3 text-lg font-semibold shadow-none focus-visible:ring-0"
            />
            <span className="flex h-14 items-center border-l border-gray-100 px-3 text-sm font-medium text-gray-600">
              {budget.currency}
            </span>
            <select
              aria-label="Budget type"
              value={budget.type}
              onChange={(event) =>
                onChange({
                  type: event.target.value as "daily" | "lifetime",
                })
              }
              className="h-14 border-0 border-l border-gray-100 bg-white px-3 text-sm text-gray-600 outline-none"
            >
              <option value="daily">Daily</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>
          {accountRules && (
            <p className="mt-2 text-xs text-gray-500">
              Meta bills this account in {budget.currency}. Schedule times use{" "}
              {accountRules.timezoneName}; minimum daily budget is{" "}
              {currencySymbol(budget.currency)}
              {accountRules.minimumDailyBudget.toLocaleString()}.
            </p>
          )}
          {budget.amount < (accountRules?.minimumDailyBudget ?? 0.01) && (
            <p className="mt-2 text-sm text-red-600">
              Enter at least {currencySymbol(budget.currency)}
              {(accountRules?.minimumDailyBudget ?? 0.01).toLocaleString()}.
            </p>
          )}
        </div>

        <div>
          <p className="text-base font-medium text-gray-800">Start date</p>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_9rem] gap-3">
            <label className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                aria-label="Campaign start date"
                type="date"
                value={startDate}
                onChange={(event) => updateStart(event.target.value, startTime)}
                className="h-14 pl-10 text-base"
              />
            </label>
            <label className="relative">
              <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                aria-label="Campaign start time"
                type="time"
                value={startTime}
                onChange={(event) => updateStart(startDate, event.target.value)}
                className="h-14 pl-10 text-base"
              />
            </label>
          </div>

          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={Boolean(budget.endDate)}
              onChange={(event) =>
                event.target.checked
                  ? enableEndDate()
                  : onChange({ endDate: undefined })
              }
              className="h-5 w-5 rounded border-gray-300 accent-violet-500"
            />
            Set an end date
          </label>

          {budget.endDate && (
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_9rem] gap-3">
              <Input
                aria-label="Campaign end date"
                type="date"
                value={endDate}
                onChange={(event) => updateEnd(event.target.value, endTime)}
                className="h-12 text-base"
              />
              <Input
                aria-label="Campaign end time"
                type="time"
                value={endTime}
                onChange={(event) => updateEnd(endDate, event.target.value)}
                className="h-12 text-base"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CampaignBudgetEditor;
