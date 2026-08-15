"use client";

import { useEffect } from "react";
import {
  trackScreenViewed,
  type AnalyticsFlow,
  type AnalyticsProps,
} from "./analytics";

export const useScreenView = (
  flow: AnalyticsFlow,
  screen: string | null,
  extra?: AnalyticsProps,
) => {
  const extraKey = extra ? JSON.stringify(extra) : "";

  useEffect(() => {
    if (!screen) return;
    trackScreenViewed(flow, screen, extra);
  }, [extra, extraKey, flow, screen]);
};
