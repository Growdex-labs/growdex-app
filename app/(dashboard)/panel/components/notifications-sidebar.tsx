"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function NotificationsSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navItems = [
    {
      label: "Comments",
      href: "/panel/notifications?tab=comments",
      tab: "comments",
    },
    { label: "Tags", href: "/panel/notifications?tab=tags", tab: "tags" },
    {
      label: "Reminders",
      href: "/panel/notifications?tab=reminders",
      tab: "reminders",
    },
  ];

  const activeTab = searchParams.get("tab") || "comments";

  return (
    <div className="w-64 h-screen flex flex-col justify-between bg-white border-r border-gray-200 p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6 mt-4">
          Notifications
        </h2>
        <div className="space-y-2 mb-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.tab
                  ? "bg-lavender-50 text-gray-900 font-medium"
                  : "text-gray-400 hover:bg-lavender-50 hover:text-gray-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/panel"
        className="flex items-center p-2 rounded-xl bg-gray-50 gap-2 text-sm text-gray-400 hover:text-gray-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-gray-900" />
        Back
      </Link>
    </div>
  );
}
