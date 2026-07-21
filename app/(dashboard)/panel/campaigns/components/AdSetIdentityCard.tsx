"use client";

import { Layers3 } from "lucide-react";

interface AdSetIdentityCardProps {
  value: string;
  onChange: (value: string) => void;
}

export function AdSetIdentityCard({ value, onChange }: AdSetIdentityCardProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-dimYellow text-gray-800">
          <Layers3 className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-gilroy-semibold uppercase tracking-[0.14em] text-violet-500">
            Ad set setup
          </p>
          <h2 className="mt-1 text-xl font-gilroy-bold text-gray-950">
            Name this ad set
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            This ad set groups its tracking, audience, devices, budget,
            schedule, and ads.
          </p>
          <label className="mt-5 block text-sm font-gilroy-semibold text-gray-700">
            Ad set name
            <input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              maxLength={100}
              placeholder="Primary ad set"
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-khaki-300 focus:ring-2 focus:ring-khaki-200/30"
            />
          </label>
        </div>
      </div>
    </section>
  );
}

export default AdSetIdentityCard;
