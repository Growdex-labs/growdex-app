"use client";

import React from "react";
import { MeProvider } from "@/context/me-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <MeProvider>{children}</MeProvider>;
}
