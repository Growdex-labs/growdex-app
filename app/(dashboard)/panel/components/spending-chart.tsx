'use client';

import { Facebook, Instagram } from 'lucide-react';
import { ChartDataPoint, formatCurrency } from '@/lib/mock-data';

interface SpendingChartProps {
  data: ChartDataPoint[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  // Calculate max value for scaling
  const maxValue = Math.max(
    ...data.flatMap(d => [d.meta, d.tiktok])
  );

  // Scale factor to fit chart
  const scale = 100 / maxValue;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-gray-600">Total amount spent</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <div className="text-3xl font-bold text-gray-900 mb-8">
        {formatCurrency(11567980.98)}
      </div>

      {/* Y-axis labels */}
      <div className="relative h-64 mb-8">
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 pr-4">
          <span>16,000.00</span>
          <span>14,000.00</span>
          <span>12,500.00</span>
          <span>10,000.00</span>
          <span>7,500.00</span>
          <span>2,5000</span>
        </div>

        {/* Chart area */}
        <div className="ml-20 h-full flex items-end justify-between gap-8">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-4">
              {/* Bars container */}
              <div className="w-full flex items-end justify-center gap-1.5 h-56">
                {/* Meta bar */}
                <div className="w-8 bg-gray-300 rounded-t-sm" style={{ height: `${item.meta * scale}%` }} />
                {/* TikTok bar */}
                <div className="w-8 bg-gray-800 rounded-t-sm" style={{ height: `${item.tiktok * scale}%` }} />
              </div>

              {/* Platform icons */}
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
                  <img src="/logos_meta-icon.png" alt="meta" className="w-3 h-3" />
                </div>
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </div>
              </div>

              {/* Date label */}
              <div className="text-xs text-gray-400 mt-2">{item.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
