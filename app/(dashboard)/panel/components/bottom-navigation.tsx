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

  // Right items (2 items)
  const rightItems: NavItem[] = [
    { icon: Wallet, label: "Funding", href: "/panel/wallet" },
    { icon: Images, label: "Assets", href: "/panel/assets" },
    { icon: Settings, label: "Settings", href: "/panel/settings/manage-account" },
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
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-40">
        {/* Black background container */}
        <div className="relative bg-[#333333] rounded-full h-16 border border-gray-700 flex items-center justify-center">
          {/* Left items */}
          <div className="flex items-center justify-around flex-1 h-full mr-10">
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
                >
                  <Icon className="w-6 h-6" />
                </Link>
              );
            })}
          </div>

          {/* Center Create Button - Over black background */}
          <Link
            href="/panel/campaigns/new"
            className="flex items-center justify-center w-14 h-14 bg-white text-gray-900 rounded-lg transition-all hover:scale-110 shadow-lg absolute z-10 "
            title="Create Campaign"
          >
            <Plus className="w-7 h-7" />
          </Link>

          {/* Right items */}
          <div className="flex items-center justify-around flex-1 ml-10 h-full">
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
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Padding for mobile to account for nav height */}
      <div className="md:hidden h-20" />
    </>
  );
}
