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
                  className={`flex flex-col items-center justify-center h-full gap-1 transition-colors ${
                    active ? "text-khaki-200" : "text-gray-400 hover:text-white"
                  }`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="w-6 h-6" />
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
          <div className="ml-8 flex h-full flex-1 items-center justify-around sm:ml-10">
            {rightItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center h-full gap-1 transition-colors ${
                    active ? "text-khaki-200" : "text-gray-400 hover:text-white"
                  }`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Padding for mobile to account for nav height */}
      <div className="h-20 shrink-0 lg:hidden" />
    </>
  );
}
