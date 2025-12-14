'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { logout } from '@/lib/auth';

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export function CollapsibleSidebar({ userName = 'Tunmi Lawal', userEmail = 'tunmi@growdex.com' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/panel' },
    { icon: Megaphone, label: 'Campaigns', href: '/panel/campaigns' },
    { icon: Wallet, label: 'Wallet', href: '/panel/wallet' },
    { icon: Settings, label: 'Settings', href: '/panel/settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/panel') {
      return pathname === '/panel';
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside
      className={`h-screen bg-[#2a2a2a] text-white flex flex-col transition-all duration-300 relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className={`p-6 ${isCollapsed ? 'px-4' : 'px-6'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex-shrink-0">
            <img src="/logo.png" alt="logo" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-xl">Growdex</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-white text-gray-800 cursor-pointer mb-4">
          <Plus className='flex-shrink-0' />
          {!isCollapsed && (
            <span>Create campaign</span>
          )}
        </button>
        <div className="space-y-1 border-t border-dimGray pt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-black text-khaki-200'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className={`p-4 border-t border-gray-700 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {userName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-white truncate">{userName}</div>
              <div className="text-xs text-gray-400 truncate">{userEmail}</div>
            </div>
          )}
        </div>
        <div
          onClick={logout}
          className="mt-2 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-500 hover:bg-red-500 hover:text-white cursor-pointer">
          Log out
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 bg-khaki-200 text-gray-900 rounded-full p-1.5 border-2 border-[#2a2a2a] hover:bg-khaki-300 transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
