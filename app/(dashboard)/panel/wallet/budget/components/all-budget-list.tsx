'use client';

import { Pencil } from 'lucide-react';
import Link from 'next/link';

interface Budget {
  id: string;
  name: string;
  icon: string;
  status: 'running' | 'paused' | 'completed';
  usedPercent: number;
  amount: number;
  isActive: boolean;
}

// Mock budget data
const mockBudgets: Budget[] = [
  {
    id: '1',
    name: 'Election Budget',
    icon: '/ic_baseline-plus.png',
    status: 'running',
    usedPercent: 20,
    amount: 135890.90,
    isActive: true,
  },
  {
    id: '2',
    name: 'Marketing Campaign',
    icon: '/ic_baseline-plus.png',
    status: 'running',
    usedPercent: 65,
    amount: 250000.00,
    isActive: true,
  },
  {
    id: '3',
    name: 'Product Launch',
    icon: '/ic_baseline-plus.png',
    status: 'paused',
    usedPercent: 45,
    amount: 180000.00,
    isActive: false,
  },
];

export default function AllBudgetList() {
  return (
    <div className="space-y-4 mt-4">
      {mockBudgets.map((budget) => (
        <div
          key={budget.id}
          className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          {/* Budget Icon */}
          <div className="w-14 h-14 bg-gray-100 border border-khaki-200 rounded-full flex items-center justify-center flex-shrink-0">
            {budget.icon ? (
              <img src={budget.icon} alt={budget.name} className="w-11 h-11 object-contain" />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            )}
          </div>

          {/* Budget Name */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {budget.name}
            </h3>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12">
              {/* Progress Circle */}
              <svg className="w-12 h-12 transform -rotate-90 animate-spin">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#E5E7EB"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke={budget.usedPercent > 70 ? '#EF4444' : budget.usedPercent > 50 ? '#FBBF24' : '#10B981'}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(budget.usedPercent / 100) * 125.6} 125.6`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              <span className="font-medium">{budget.status}</span>
              <span className="text-gray-400"> / </span>
              <span className="font-medium">{budget.usedPercent}% used</span>
            </div>
          </div>

          {/* Amount */}
          <div className="text-lg font-semibold text-gray-900 whitespace-nowrap">
            ₦{budget.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          {/* Status Badge */}
          <div>
            <span
              className={`px-6 py-2 rounded-lg text-sm font-medium ${
                budget.isActive
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {budget.isActive ? 'Active' : 'Paused'}
            </span>
          </div>

          {/* Edit Button */}
          <Link
            href={`/panel/wallet/budget/${budget.id}/edit`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Pencil className="w-5 h-5 text-darkkhaki-200" />
          </Link>
        </div>
      ))}

      {/* Empty State */}
      {mockBudgets.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No budgets found. Create your first budget to get started.</p>
        </div>
      )}
    </div>
  );
}
