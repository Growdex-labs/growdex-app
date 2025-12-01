'use client';

import { ReactNode } from 'react';
import { CollapsibleSidebar } from './collapsible-sidebar';
import { mockUser } from '@/lib/mock-data';

interface PanelLayoutProps {
  children: ReactNode;
}

export function PanelLayout({ children }: PanelLayoutProps) {
  return (
    <div className="h-screen flex bg-gray-50">
      <CollapsibleSidebar
        userName={mockUser.name}
        userEmail={mockUser.email}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
