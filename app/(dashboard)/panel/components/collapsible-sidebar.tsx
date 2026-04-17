"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { useMe } from "@/context/me-context";
import { useSocket } from "@/context/socket-context";

interface CollapsibleSidebarProps {
  onNotificationClick?: () => void;
}

export function CollapsibleSidebar({ onNotificationClick }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { me, isLoading } = useMe();
  const { unreadCount } = useSocket();

  const userName =
    me?.profile?.firstName && me?.profile?.lastName
      ? `${me.profile.firstName} ${me.profile.lastName}`
      : (me?.email ?? "Account");
  const userEmail = me?.email ?? "";

  const initialsSource = userName || userEmail || "A";
  const initials = initialsSource
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/panel" },
    { icon: Megaphone, label: "Campaigns", href: "/panel/campaigns" },
    { icon: Wallet, label: "Wallet", href: "/panel/wallet" },
    { icon: Settings, label: "Settings", href: "/panel/settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/panel") {
      return pathname === "/panel";
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside
      className={`h-screen bg-[#2a2a2a] text-white hidden md:flex flex-col transition-all duration-300 relative ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div className={`p-6 ${isCollapsed ? "px-4" : "px-6"}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0">
              <img src="/logo.png" alt="logo" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-xl">Growdex</span>
            )}
          </div>

          {/* Notification Button */}
          <div className="flex gap-2 relative">
            <Bell className="shrink-0 cursor-pointer text-khaki-300 size-6" onClick={onNotificationClick} />
            {unreadCount > 0 && (
              <div className="w-5 h-5 bg-khaki-300 rounded-full absolute -top-2 -right-3 flex items-center justify-center text-xs text-gray-900 font-bold">
                {unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <Link
          href="/panel/campaigns/new"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-white text-gray-800 cursor-pointer mb-4"
        >
          <Plus className="shrink-0" />
          {!isCollapsed && <span>Create campaign</span>}
        </Link>
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
                    ? "bg-black text-khaki-200"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div
        className={`p-4 border-t border-gray-700 ${isCollapsed ? "px-2" : "px-4"}`}
      >
        <div
          className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}
        >
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-semibold text-sm">{initials}</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-white truncate">
                {isLoading ? "Loading…" : userName}
              </div>
              <div className="text-xs text-gray-400 truncate">{userEmail}</div>
            </div>
          )}
        </div>
        <div
          onClick={logout}
          className="mt-2 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
        >
          Log out
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 bg-khaki-200 text-gray-900 rounded-full p-1.5 border-2 border-[#2a2a2a] hover:bg-khaki-300 transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
