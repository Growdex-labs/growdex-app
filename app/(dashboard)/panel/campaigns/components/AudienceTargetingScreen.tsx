"use client";

import { useState } from "react";
import { DemographicsForm } from "./DemographicsForm";
import { AudienceReachCard } from "./AudienceReachCard";

interface AudienceTargetingScreenProps {
  onConfirm?: () => void;
}

export function AudienceTargetingScreen({
  onConfirm,
}: AudienceTargetingScreenProps) {
  const [activeTab, setActiveTab] = useState("Demographics");

  const heading =
    activeTab === "Budget"
      ? "How much do you want to spend?"
      : "Find the people you want to reach";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{heading}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start">
        {/* Next walks through the tabs, then advances the step */}
        <DemographicsForm
          showLocationSearch
          onNext={onConfirm}
          onTabChange={setActiveTab}
        />
        <AudienceReachCard label="You will reach" />
      </div>
    </div>
  );
}

export default AudienceTargetingScreen;
