"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function SettingsSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Manage Permissions", href: "/panel/settings/manage-permissions" },
    { label: "Manage Account", href: "/panel/settings/manage-account" },
    {
      label: "Security & Access Control",
      href: "/panel/settings/security-control",
    },
    {
      label: "Support & Help",
      href: "/panel/settings/support-and-help",
    },
    {
      label: "Data & Privacy",
      href: "/panel/settings/data-privacy",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/panel/settings/manage-account") {
      return pathname === "/panel/settings/manage-account";
    }
    if (href === "/panel/settings/manage-permissions") {
      return pathname === "/panel/settings/manage-permissions";
    }
    if (href === "/panel/settings/security-control") {
      return pathname === "/panel/settings/security-control";
    }
    if (href === "/panel/settings/support-and-help") {
      return pathname === "/panel/settings/support-and-help";
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="w-64 h-screen flex flex-col justify-between bg-white border-r border-gray-200 p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6 mt-4">Settings</h2>
        <div className="space-y-2 mb-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.href)
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
