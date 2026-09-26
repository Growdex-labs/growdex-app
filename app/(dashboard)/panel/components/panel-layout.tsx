"use client";

import { ReactNode, createContext, useContext, useMemo, useState } from "react";
import { CollapsibleSidebar } from "./collapsible-sidebar";
import { TopHeader } from "./top-header";
import { BottomNavigation } from "./bottom-navigation";
import { NotificationSidebar } from "./notification-sidebar";

interface PanelLayoutProps {
  children: ReactNode;
  defaultSidebarCollapsed?: boolean;
}

interface PanelChrome {
  openNotifications: () => void;
}

const PanelChromeContext = createContext<PanelChrome>({
  openNotifications: () => {},
});

/** Lets a page open the chrome the layout owns, such as the notification panel. */
export const usePanelChrome = () => useContext(PanelChromeContext);

export function PanelLayout({
  children,
  defaultSidebarCollapsed = false,
}: PanelLayoutProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const chrome = useMemo<PanelChrome>(
    () => ({ openNotifications: () => setIsNotificationOpen(true) }),
    [],
  );

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-gray-50">
    <div className="flex h-dvh min-h-[480px] flex-col overflow-hidden bg-gray-50">
      <TopHeader onNotificationClick={() => setIsNotificationOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <CollapsibleSidebar
          defaultCollapsed={defaultSidebarCollapsed}
          onNotificationClick={() => setIsNotificationOpen(true)}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-[calc(5.75rem+env(safe-area-inset-bottom))] lg:pb-0 hide-scrollbar">
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-24 lg:pb-0 hide-scrollbar">
          <PanelChromeContext.Provider value={chrome}>
            {children}
          </PanelChromeContext.Provider>
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
