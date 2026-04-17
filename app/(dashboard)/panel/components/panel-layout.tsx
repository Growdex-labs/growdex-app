"use client";

import { ReactNode, useState } from "react";
import { CollapsibleSidebar } from "./collapsible-sidebar";
import { TopHeader } from "./top-header";
import { BottomNavigation } from "./bottom-navigation";
import { NotificationSidebar } from "./notification-sidebar";

interface PanelLayoutProps {
  children: ReactNode;
}

export function PanelLayout({ children }: PanelLayoutProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopHeader />
      <div className="flex flex-1 overflow-hidden">
        <CollapsibleSidebar onNotificationClick={() => setIsNotificationOpen(true)} />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 hide-scrollbar">
          {children}
        </main>
        <NotificationSidebar
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />
      </div>
      <BottomNavigation />
    </div>
  );
}
