"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactRound, Images, LayoutDashboard, Megaphone, Plus, Settings } from "lucide-react";

const items = [
  { icon: LayoutDashboard, label: "Overview", href: "/panel" },
  { icon: Megaphone, label: "Campaigns", href: "/panel/campaigns" },
  { icon: ContactRound, label: "Leads", href: "/panel/leads" },
  { icon: Images, label: "Assets", href: "/panel/assets" },
  { icon: Settings, label: "Settings", href: "/panel/settings/profile", section: "/panel/settings" },
];

export function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary navigation" className="fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-md lg:hidden sm:inset-x-6">
      <div className="relative flex h-16 items-center rounded-full border border-gray-700 bg-[#333] px-1 shadow-xl">
        {items.map((item, index) => {
          const active = item.href === "/panel" ? pathname === "/panel" : pathname?.startsWith(item.section ?? item.href);
          return <Link key={item.href} href={item.href} className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 ${index === 2 ? "mr-12" : ""} ${active ? "text-khaki-200" : "text-gray-400"}`}><item.icon className="size-5" /><span className="max-w-full truncate text-[9px]">{item.label}</span></Link>;
        })}
        <Link href="/panel/campaigns/new" aria-label="Create campaign" className="absolute left-1/2 flex size-12 -translate-x-1/2 items-center justify-center rounded-xl bg-white text-gray-900 shadow-lg"><Plus className="size-7" /></Link>
      </div>
    </nav>
  );
}
