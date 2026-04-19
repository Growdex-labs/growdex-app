"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  BellIcon,
  Check,
  ChevronsRight,
  ListFilterIcon,
  SettingsIcon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useSocket, Notification } from "@/context/socket-context";
import { useState } from "react";

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Grouping helpers ─────────────────────────────────────────────────────────

function groupByDate(notifications: Notification[]): Record<string, Notification[]> {
  return notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});
}

function sortedDateKeys(groups: Record<string, Notification[]>): string[] {
  return Object.keys(groups).sort((a, b) => {
    if (a === "Today") return -1;
    if (b === "Today") return 1;
    if (a === "Yesterday") return -1;
    if (b === "Yesterday") return 1;

    // Parse remaining keys as dates for chronological sorting
    const timeA = Date.parse(a);
    const timeB = Date.parse(b);
    
    // If both are valid dates, sort descending (newest first)
    if (!isNaN(timeA) && !isNaN(timeB)) {
      return timeB - timeA;
    }

    // Fallback to string comparison
    return b.localeCompare(a);
  });
}

// ─── Single notification row ──────────────────────────────────────────────────

function NotificationRow({ item }: { item: Notification }) {
  return (
    <div className="flex items-start gap-3 py-3">
      {/* Checkbox */}
      <div className="mt-1 shrink-0">
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            item.isRead
              ? "border-gray-600"
              : "border-gray-400 bg-transparent"
          }`}
        >
          {item.isRead && (
            <Check className="size-5 text-khaki-300" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug mb-4 ${item.isRead ? "text-gray-400" : "text-white"}`}>
          {item.content}
        </p>
        <div className="flex items-center gap-4 mt-1.5">
          <span className="text-xs text-gray-500">{item.time}</span>
          <button className="text-xs text-khaki-200 hover:text-khaki-300 transition-colors font-medium">
            {item.action}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────

export function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
  const { notifications, unreadCount, markAllRead } = useSocket();
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsOff, setNotificationsOff] = useState(false);

  const grouped = groupByDate(notifications);
  const dateKeys = sortedDateKeys(grouped);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent hideClose className="w-[320px] sm:w-[320px] bg-[#2b2b2b] text-white border-none flex flex-col gap-0 p-0">
        {/* ── Header ────────────────────────────────────────────── */}
        <SheetHeader className="px-4 pt-5 pb-3 space-y-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 -ml-1 rounded-md text-gray-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-khaki-200 shrink-0"
              aria-label="Close"
            >
              <ChevronsRight className="size-6" />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <div className="bg-red-700 p-1 rounded-full">
                <BellIcon className="size-5" />
              </div>
              <p className="text-white text-base font-semibold">
                Notifications
              </p>
              {!showSettings && unreadCount > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <ListFilterIcon className="size-5 cursor-pointer hover:text-white transition-colors" />
              <SettingsIcon
                className={`size-5 cursor-pointer transition-colors ${showSettings ? "text-khaki-200" : "hover:text-white"}`}
                onClick={() => setShowSettings(!showSettings)}
              />
            </div>
          </div>
          {!showSettings && unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-khaki-200 hover:text-khaki-300 transition-colors text-left mt-2 ml-auto"
            >
              Mark all as read
            </button>
          )}
        </SheetHeader>

        {/* ── Content ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {showSettings ? (
            <div className="flex flex-col">
              {/* Settings Header */}
              <div className="px-4 py-3 bg-[#4D4D4D] rounded-sm mx-2 mt-4">
                <p className="text-sm font-medium text-white">Notification settings</p>
              </div>

              {/* Toggle Option */}
              <div className="px-4 py-8 flex items-center justify-between">
                <span className="text-sm text-white">Turn off notifications</span>
                <Switch
                  checked={notificationsOff}
                  onCheckedChange={setNotificationsOff}
                  className="data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-600"
                />
              </div>
            </div>
          ) : (
            <>
              {dateKeys.length === 0 && (
                <p className="text-sm text-gray-500 text-center mt-16">
                  No notifications yet
                </p>
              )}

              {dateKeys.map((dateLabel) => (
                <div key={dateLabel}>
                  {/* Date group header */}
                  <div className="px-2 py-2 bg-[#4D4D4D] rounded-sm mx-2 sticky top-0 z-10">
                    <p className="text-xs font-medium text-gray-400">{dateLabel}</p>
                  </div>

                  {/* Rows */}
                  <div className="px-4">
                    {grouped[dateLabel].map((item) => (
                      <NotificationRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}