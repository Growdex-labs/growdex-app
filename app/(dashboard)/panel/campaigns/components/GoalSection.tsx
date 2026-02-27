"use client";

import React from "react";
import { CampaignGoal } from "@/lib/campaigns";

interface GoalSectionProps {
  progressTab: number;
  setProgressTab: (tab: number) => void;
  campaignGoal: CampaignGoal;
  setCampaignGoal: (goal: CampaignGoal) => void;
  readOnly?: boolean;
}

export const GoalSection = ({
  progressTab,
  setProgressTab,
  campaignGoal,
  setCampaignGoal,
  readOnly = false,
}: GoalSectionProps) => {
  return (
    <div
      className={`bg-white rounded-xl p-4 border ${
        progressTab === 0 ? "border-darkkhaki-200" : "border-transparent"
      } bg-[url('/campaign-goal.png')] bg-contain`}
      style={{
        backgroundPosition: "right, bottom",
        backgroundRepeat: "no-repeat",
      }}
      onClick={() => setProgressTab(0)}
    >
      <div className="flex gap-3 items-center">
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
            <div className="w-0 h-36 border border-peru-200" />
          </div>
          <div>
            <label
              htmlFor="campaignGoal"
              className="block text-sm font-medium text-gray-500"
            >
              Set Campaign goal
            </label>
            {/* radio group */}
            <div className="flex flex-col mt-1 gap-3">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="campaignGoal"
                  value="awareness"
                  checked={campaignGoal.toLowerCase() === "awareness"}
                  onChange={(e) =>
                    setCampaignGoal(e.target.value.toUpperCase())
                  }
                  disabled={readOnly}
                  className="form-radio"
                />
                <span className="ml-2">Awareness</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="campaignGoal"
                  value="traffic"
                  checked={campaignGoal.toLowerCase() === "traffic"}
                  onChange={(e) =>
                    setCampaignGoal(e.target.value.toUpperCase())
                  }
                  disabled={readOnly}
                  className="form-radio"
                />
                <span className="ml-2">Traffic</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="campaignGoal"
                  value="conversions"
                  checked={campaignGoal.toLowerCase() === "conversions"}
                  onChange={(e) =>
                    setCampaignGoal(e.target.value.toUpperCase())
                  }
                  disabled={readOnly}
                  className="form-radio"
                />
                <span className="ml-2">Conversions</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="campaignGoal"
                  value="sales"
                  checked={campaignGoal.toLowerCase() === "sales"}
                  onChange={(e) =>
                    setCampaignGoal(e.target.value.toUpperCase())
                  }
                  disabled={readOnly}
                  className="form-radio"
                />
                <span className="ml-2">Sales</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="campaignGoal"
                  value="leads"
                  checked={campaignGoal.toLowerCase() === "leads"}
                  onChange={(e) =>
                    setCampaignGoal(e.target.value.toUpperCase())
                  }
                  disabled={readOnly}
                  className="form-radio"
                />
                <span className="ml-2">Leads</span>
              </label>
            </div>
            <div className="bg-gray-50 p-2 mt-4 w-fit">
              <ul className="list-disc list-inside">
                <li>
                  <small className="font-gilroy-bold">
                    Show your ad to as many people as possible to increase brand
                    visibility and reach.
                  </small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
