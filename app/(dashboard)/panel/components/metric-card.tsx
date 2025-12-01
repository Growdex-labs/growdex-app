'use client';

import { ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';

interface MetricCardProps {
  title: string;
  icon?: ReactNode;
  value?: string | number;
  trend?: number;
  trendLabel?: string;
  children?: ReactNode;
  variant?: 'default' | 'yellow' | 'orange';
  className?: string;
}

export function MetricCard({
  title,
  icon,
  value,
  trend,
  trendLabel,
  children,
  variant = 'default',
  className = '',
}: MetricCardProps) {
  const bgColor = variant === 'yellow'
    ? 'bg-dimYellow'
    : variant === 'orange'
    ? 'bg-orange-50'
    : 'bg-white';

  const borderColor = variant === 'yellow'
    ? 'border-yellow-100'
    : variant === 'orange'
    ? 'border-orange-100'
    : 'border-gray-200';

  return (
    <div className={`${bgColor} min-h-48 border ${borderColor} rounded-xl p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-700">{icon}</span>}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {value !== undefined && (
        <div className="mb-2">
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
      )}

      {trend !== undefined && (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          {trendLabel && (
            <span className="text-sm text-gray-500">{trendLabel}</span>
          )}
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

export function ProgressBar({ label, value, total, color }: ProgressBarProps) {
  const percentage = (value / total) * 100;

  const colorClasses: Record<string, string> = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
    red: 'bg-red-500',
    gray: 'bg-gray-300',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-xs text-gray-600 w-20">{label}</span>
        <div className="flex-1 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="text-xs font-medium text-gray-900 ml-3">{value}</span>
    </div>
  );
}
