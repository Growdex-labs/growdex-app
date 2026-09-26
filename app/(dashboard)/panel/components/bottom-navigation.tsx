"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Wallet,
  Images,
  Settings,
  Plus,
} from "lucide-react";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

export function BottomNavigation() {
  const pathname = usePathname();

  // Left items (2 items)
  const leftItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/panel" },
    { icon: Megaphone, label: "Campaigns", href: "/panel/campaigns" },
  ];

  // Right items (3 items)
  const rightItems: NavItem[] = [
    { icon: Wallet, label: "Billing", href: "/panel/billing" },
    { icon: Images, label: "Assets", href: "/panel/assets" },
    { icon: Settings, label: "Settings", href: "/panel/settings/profile" },
  ];

  const isActive = (item: NavItem) => {
    if (item.href === "/panel") {
      return pathname === "/panel";
    }
    if (item.label === "Settings") {
      return pathname?.startsWith("/panel/settings");
    }
    return pathname?.startsWith(item.href);
  };

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-md lg:hidden sm:inset-x-6 sm:bottom-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
        {/* Black background container */}
        <div className="relative flex h-16 items-center justify-center rounded-full border border-gray-700 bg-[#333333] px-1 shadow-xl">
          {/* Left items */}
          <div className="mr-7 flex h-full min-w-0 flex-1 items-center justify-around sm:mr-10">
    <>
      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-md lg:hidden sm:inset-x-6">
        {/* Black background container */}
        <div className="relative flex h-16 items-center justify-center rounded-full border border-gray-700 bg-[#333333] px-1 shadow-xl">
          {/* Left items */}
          <div className="mr-8 flex h-full flex-1 items-center justify-around sm:mr-10">
            {leftItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 transition-colors ${
                    active ? "text-khaki-200" : "text-gray-400 hover:text-white"
                  }`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="w-6 h-6" />
                  <span className="max-w-full truncate text-[9px] leading-none sm:text-[10px]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Center Create Button - Over black background */}
          <Link
            href="/panel/campaigns/new"
            className="absolute z-10 flex size-12 items-center justify-center rounded-xl bg-white text-gray-900 shadow-lg transition-all hover:scale-105 sm:size-14"
            title="Create Campaign"
            aria-label="Create campaign"
          >
            <Plus className="w-7 h-7" />
          </Link>

          {/* Right items */}
          <div className="ml-7 flex h-full min-w-0 flex-1 items-center justify-around sm:ml-10">
          <div className="ml-8 flex h-full flex-1 items-center justify-around sm:ml-10">
            {rightItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 transition-colors ${
                    active ? "text-khaki-200" : "text-gray-400 hover:text-white"
                  }`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="max-w-full truncate text-[9px] leading-none sm:text-[10px]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
    </nav>
      </nav>

      {/* Bottom Padding for mobile to account for nav height */}
      <div className="h-20 shrink-0 lg:hidden" />
    </>
  );
}
