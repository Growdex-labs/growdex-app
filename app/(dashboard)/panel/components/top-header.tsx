"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Images,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Plug,
  Settings,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMe } from "@/context/me-context";
import { useSocket } from "@/context/socket-context";
import { logout } from "@/lib/auth";

interface TopHeaderProps {
  onNotificationClick?: () => void;
}

export function TopHeader({ onNotificationClick }: TopHeaderProps) {
  const { me, isLoading } = useMe();
  const { unreadCount } = useSocket();
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const userName =
    me?.profile?.firstName && me?.profile?.lastName
      ? `${me.profile.firstName} ${me.profile.lastName}`
      : (me?.email ?? "Account");

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/panel" },
    { icon: Megaphone, label: "Campaigns", href: "/panel/campaigns" },
    { icon: Images, label: "Assets", href: "/panel/assets" },
    { icon: Plug, label: "Integrations", href: "/panel/integrations" },
    { icon: Wallet, label: "Billing", href: "/panel/billing" },
    {
      icon: Settings,
      label: "Settings",
      href: "/panel/settings/profile",
      section: "/panel/settings",
    },
    ...(me?.isAdmin
      ? [{ icon: ShieldCheck, label: "Admin", href: "/panel/admin" }]
      : []),
  ];

  const isActive = (item: { href: string; section?: string }) => {
    if (item.href === "/panel") {
      return pathname === "/panel";
    }
    return pathname?.startsWith(item.section ?? item.href);
  };

  return (
    <header className="bg-white text-gray-900 px-4 py-4 flex items-center justify-between h-16 shadow-md md:hidden">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 shrink-0">
          <Image src="/logo2.png" alt="Growdex logo" width={32} height={32} className="size-8" />
        </div>
        <span className="font-gilroy-semibold text-lg">Growdex</span>
      </div>

      {/* Right: notifications, avatar, nav menu */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onNotificationClick}
          aria-label="Open notifications"
          className="relative p-1 text-gray-700 hover:text-gray-900"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-khaki-300 px-0.5 text-[10px] font-gilroy-bold text-gray-900">
              {unreadCount}
            </span>
          )}
        </button>

        <Link href="/panel/profile" className="shrink-0">
          <Image
            src={me?.avatarUrl ?? "/profile.png"}
            width={40}
            height={40}
            unoptimized
            className="size-9 rounded-full object-cover"
            alt="profile-icon"
          />
        </Link>

        <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="p-1 text-gray-700 hover:text-gray-900"
            >
              <Menu className="size-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 max-w-[85vw] p-0">
            <SheetHeader className="border-b border-gray-100 p-4">
              <SheetTitle className="flex items-center gap-2">
                <Image
                  src="/logo2.png"
                  alt=""
                  width={24}
                  height={24}
                  className="size-6"
                />
                Growdex
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-1 p-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsNavOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                      active
                        ? "bg-lavender-50 font-gilroy-medium text-gray-900"
                        : "text-gray-500 hover:bg-lavender-50 hover:text-gray-800"
                    }`}
                  >
                    <Icon className="size-5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto border-t border-gray-100 p-4">
              <div className="mb-3 flex items-center gap-3 px-2">
                <Image
                  src={me?.avatarUrl ?? "/profile.png"}
                  width={36}
                  height={36}
                  unoptimized
                  className="size-9 rounded-full object-cover"
                  alt=""
                />
                <p className="truncate text-sm font-gilroy-medium text-gray-900">
                  {isLoading ? "Loading…" : userName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
              >
                <LogOut className="size-5 shrink-0" />
                Log out
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
