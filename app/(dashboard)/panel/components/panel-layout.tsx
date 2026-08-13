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
    <div className="h-screen flex flex-col bg-gray-50">
      <TopHeader />
      <div className="flex flex-1 overflow-hidden">
        <CollapsibleSidebar
          defaultCollapsed={defaultSidebarCollapsed}
          onNotificationClick={() => setIsNotificationOpen(true)}
        />
        <main className="min-w-0 flex-1 overflow-y-auto pb-16 md:pb-0 hide-scrollbar">
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
