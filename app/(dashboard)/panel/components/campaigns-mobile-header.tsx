"use client";

import { type JSX, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CampaignsMobileHeaderProps {}

export function CampaignsMobileHeader(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "All campaigns", href: "/panel/campaigns" },
    { label: "New campaign", href: "/panel/campaigns/new" },
    { label: "Wallet", href: "/panel/wallet" },
    { label: "Thrashed", href: "/panel/campaigns/thrashed" },
  ];

  const isActive = (href: string) => {
    if (href === "/panel/campaigns") {
      return pathname === "/panel/campaigns";
    }
    return pathname?.startsWith(href);
  };

  const getActiveLabel = () => {
    const activeItem = navItems.find((item) => isActive(item.href));
    return activeItem?.label || "Campaigns";
  };

  return (
    <div className="md:hidden flex items-center justify-between p-4 ">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="flex items-center gap-2 font-semibold text-gray-900 hover:text-gray-700 transition-colors">
            {getActiveLabel()}
            <ChevronDown className="w-4 h-4" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-6 border-b border-gray-200">
            <SheetTitle>{getActiveLabel()}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col justify-between h-[calc(100vh-120px)]">
            <div className="space-y-2 p-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
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

            <div className="p-6 border-t border-gray-200">
              <Link
                href="/panel"
                onClick={() => setIsOpen(false)}
                className="flex items-center p-2 rounded-xl bg-gray-50 gap-2 text-sm text-gray-400 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-900" />
                Back
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
