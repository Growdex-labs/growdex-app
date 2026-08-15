"use client";

import Link from "next/link";
import { BarChart3, Bell, CircleHelp, Search } from "lucide-react";
import { useMe } from "@/context/me-context";
import { useSocket } from "@/context/socket-context";
import { usePanelChrome } from "./panel-layout";

const formatToday = () =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(new Date())
    .replace(/ (\d{4})$/, ", $1");

export function DashboardTopBar({
  variant = "default",
  onSwitchToDefault,
}: {
  variant?: "default" | "insights";
  onSwitchToDefault?: () => void;
}) {
  const { me, isLoading } = useMe();
  const { unreadCount } = useSocket();
  const { openNotifications } = usePanelChrome();

  const firstName = me?.profile?.firstName ?? me?.email?.split("@")[0];

  return (
    <div className="flex flex-col gap-4 border-b border-lavender-50 pb-4 lg:flex-row lg:items-center lg:justify-between">
      {variant === "insights" ? (
        <button
          type="button"
          onClick={onSwitchToDefault}
          className="inline-flex items-center gap-2 font-inter text-sm font-medium tracking-[-0.14px] text-[#4d4d4d] transition-colors hover:text-gray-900"
        >
          <BarChart3 className="size-5" aria-hidden />
          Switch to default view
        </button>
      ) : (
        <div className="flex min-w-0 flex-col justify-center">
          <h1 className="font-lexend text-2xl font-bold text-[#4d4d4d]">
            Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-gilroy-medium text-xl tracking-[-0.2px] text-[#4d4d4d]">
              Welcome back, {isLoading ? "…" : (firstName ?? "there")}
            </p>
            <span className="size-1 rounded-full bg-bodySecondary" aria-hidden />
            <p className="font-gilroy-medium text-sm tracking-[-0.14px] text-bodySecondary">
              {formatToday()}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 xl:gap-5">
        <label className="flex h-[55px] min-w-0 flex-1 items-center gap-2 rounded-full border border-lavender-50 px-4 py-1.5 xl:w-[400px]">
          <Search className="size-5 shrink-0 text-bodySecondary" aria-hidden />
          <input
            type="search"
            placeholder="Search for anything"
            className="min-w-0 flex-1 bg-transparent font-gilroy-medium text-sm tracking-[-0.14px] text-[#333] outline-none placeholder:text-bodySecondary"
          />
        </label>

        <button
          type="button"
          onClick={openNotifications}
          className="flex shrink-0 items-center text-[#4d4d4d] transition-colors hover:text-gray-900"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="size-6" aria-hidden />
          {unreadCount > 0 && (
            <span className="flex h-4 min-w-[23px] items-center justify-center rounded-full bg-khaki-200 px-1 font-gilroy-medium text-[10px] tracking-[-0.1px] text-black-800">
              {unreadCount}
            </span>
          )}
        </button>

        {variant === "default" && (
          <>
            <Link
              href="/panel/settings/support-and-help"
              className="flex shrink-0 items-center gap-1 text-lavender-300 transition-colors hover:text-gray-900"
            >
              <CircleHelp className="size-6" aria-hidden />
              <span className="font-lexend text-[15px]">Help</span>
            </Link>

            <Link
              href="/panel/campaigns/new"
              className="shrink-0 rounded-xl bg-black px-5 py-3 text-center font-gilroy-medium text-sm tracking-[-0.14px] text-white transition-colors hover:bg-[#1a1a1a]"
            >
              Create campaign
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
