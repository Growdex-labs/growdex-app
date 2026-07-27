"use client";

import Image from "next/image";
import Link from "next/link";
import { useMe } from "@/context/me-context";
import { logout } from "@/lib/auth";

export function TopHeader() {
  const { me, isLoading } = useMe();
  const userName =
    me?.profile?.firstName && me?.profile?.lastName
      ? `${me.profile.firstName} ${me.profile.lastName}`
      : (me?.email ?? "Account");

  return (
    <header className="bg-white text-gray-900 px-6 py-4  flex items-center justify-between h-16 shadow-md sm:hidden">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 shrink-0">
          <Image src="/logo2.png" alt="Growdex logo" width={32} height={32} className="size-8" />
        </div>
        <span className="font-semibold text-lg">Growdex</span>
      </div>
      {/* Right: User Menu */}
      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="flex flex-col items-end">
          <p className="text-xs font-medium">
            {isLoading ? "Loading…" : userName}
          </p>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Log out
          </button>
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
          <Link href="/panel/profile">
            <Image
              src={me?.avatarUrl ?? "/profile.png"}
              width={40}
              height={40}
              unoptimized
              className="size-10 rounded-full object-cover"
              alt="profile-icon"
            />
          </Link>
        </div>

        {/* Logout Button */}
        {/* <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors pl-4 border-l border-gray-700"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button> */}
      </div>
    </header>
  );
}
