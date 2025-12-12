import { BarChartIcon } from "lucide-react";

interface OptimizationBadgeProps {
  percentage: number;
  size?: "sm" | "md";
}

export function OptimizationBadge({
  percentage,
  size = "md",
}: OptimizationBadgeProps) {
  const getColor = (value: number) => {
    if (value >= 70) return "text-green-700";
    if (value >= 45) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex items-center gap-2">
      <BarChartIcon
        className={`${getColor(percentage)} ${
          size === "md" ? "w-4 h-4" : "w-3 h-3"
        }`}
      />
      <span
        className={`font-semibold ${
          size === "md" ? "text-sm" : "text-xs"
        } ${getColor(percentage)}`}
      >
        {percentage}% optimized
      </span>
    </div>
  );
}
