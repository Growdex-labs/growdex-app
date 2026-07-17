"use client";

import { getTimeBasedGreeting } from "@/lib/greeting";
import { ChevronDown } from "lucide-react";
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
          <Link href="/panel/profile" className="h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-600 transition-colors gap-3 cursor-pointer">
            <img src={me?.avatarUrl ?? "/profile.png"} alt="profile-icon" className="w-7 h-7 rounded object-cover bg-gray-100" />
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500 font-gilroy-regular">
                {isLoading ? "Loading…" : userName}
              </span>
              <span className="text-[10px] text-gray-300">Edit profile</span>
            </div>
          </Link>
        </div>
      </div>
      {pathname === "/panel" && (
        <div className="flex items-center justify-between">
          <h3 className="text-2xl text-gray-800 font-gilroy-regular">Dashboard</h3>
          {/* Filter by Date */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#4d4d4d]">Filter by:</span>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <span className="text-sm text-[#4d4d4d]">Date</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
