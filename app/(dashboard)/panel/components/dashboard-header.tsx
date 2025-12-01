'use client';

import { mockUser, getTimeBasedGreeting } from '@/lib/mock-data';
import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({ userName = mockUser.name }: DashboardHeaderProps) {
  const greeting = getTimeBasedGreeting();
  const pathname = usePathname();

  return (
    <>
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-semibold text-gray-900">
        {greeting}, {userName}!
      </h1>

      <div className="flex items-center gap-4">
        {/* User Profile Button */}
        <button className="h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-600 transition-colors gap-4 cursor-pointer">
          <img src="/profile.png" alt="profile-icon" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-gray-400">
              {userName}
            </span>
            <span className="text-xs text-gray-300">Edit profile</span>
          </div>
        </button>
      </div>
    </div>
    {
      pathname === '/panel' && (
      <div className="flex justify-between mb-8">
        <h3>Dashboard</h3>
        {/* Filter by Date */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter by:</span>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">Date</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
      </div>
      )
    }
    </>
  );
}
