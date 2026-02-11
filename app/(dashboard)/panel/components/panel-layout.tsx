"use client";

import { ReactNode } from "react";
import { CollapsibleSidebar } from "./collapsible-sidebar";
import { TopHeader } from "./top-header";
import { BottomNavigation } from "./bottom-navigation";

interface PanelLayoutProps {
  children: ReactNode;
}

export function PanelLayout({ children }: PanelLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopHeader />
      <div className="flex flex-1 overflow-hidden">
        <CollapsibleSidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 hide-scrollbar">
          {children}
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}
