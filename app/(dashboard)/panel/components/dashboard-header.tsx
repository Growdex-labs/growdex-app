"use client";

import { getTimeBasedGreeting } from "@/lib/greeting";
import { usePathname } from "next/navigation";
import { useMe } from "@/context/me-context";
import Link from "next/link";

export function DashboardHeader() {
  const greeting = getTimeBasedGreeting();
  const pathname = usePathname();
  const { me, isLoading } = useMe();
  const userName =
    me?.profile?.firstName && me?.profile?.lastName
      ? `${me.profile.firstName} ${me.profile.lastName}`
      : (me?.email ?? "Account");

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-[28px] text-gray-500 font-gilroy-regular">
          {greeting}, {isLoading ? "Loading…" : userName}!
        </h1>

        <div className="flex items-center gap-4">
          {/* User Profile Button */}
          <Link
            href="/panel/profile"
            className="h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-600 transition-colors gap-2 cursor-pointer"
            title={userName}
          >
            <img src={me?.avatarUrl ?? "/profile.png"} alt="" className="w-7 h-7 rounded object-cover bg-gray-100" />
            <span className="text-sm text-gray-500 font-gilroy-regular">
              Edit profile
            </span>
          </Link>
        </div>
      </div>
      {pathname === "/panel" && (
        <h3 className="text-2xl text-gray-800 font-gilroy-regular">Dashboard</h3>
      )}
    </>
  );
}
