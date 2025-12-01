'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export function WalletSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Balance', href: '/panel/wallet' },
    { label: 'Budget', href: '/panel/wallet/budget' },
  ];

  const isActive = (href: string) => {
    if (href === '/panel/wallet') {
      return pathname === '/panel/wallet';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="w-64 h-screen flex flex-col justify-between bg-white border-r border-gray-200 p-6">
      <div className="space-y-2 mb-8">
        <h2 className="text-lg lg:text-2xl font-gilroy-semibold mb-4">Wallet</h2>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(item.href)
                ? 'bg-lavender-50 text-gray-900 font-medium'
                : 'text-gray-400 hover:bg-lavender-50 hover:text-gray-800'
            }`}
          >
            {item.label}
          </Link>
        ))}
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
