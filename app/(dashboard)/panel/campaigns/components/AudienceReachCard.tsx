"use client";

import { Sparkles } from "lucide-react";

interface AudienceReachCardProps {
  label?: string;
  reach?: string;
}

export function AudienceReachCard({
  label = "Your ad reach",
  reach = "25,000-50,000k",
}: AudienceReachCardProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-dimYellow/30 p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900">{reach}</p>
      <span className="mt-2 inline-block rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600">
        Audience too narrow
      </span>
      <div className="mt-2 rounded-lg border-2 border-purple-200 bg-purple-100 p-3">
        <p className="text-xs text-gray-600 leading-relaxed">
          Your audience is too narrow to reach your campaign goals. Setup the
          audience and budget.
        </p>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-violet-500 hover:text-violet-600"
        >
          <Sparkles className="w-3 h-3" />
          Setup the audience with AI
        </button>
      </div>
    </div>
  );
}

export default AudienceReachCard;
