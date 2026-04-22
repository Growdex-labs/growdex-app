"use client";

import React from "react";
import { MeProvider } from "@/context/me-context";
import { SocketProvider } from "@/context/socket-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MeProvider>
      <SocketProvider>{children}</SocketProvider>
    </MeProvider>
  );
}
