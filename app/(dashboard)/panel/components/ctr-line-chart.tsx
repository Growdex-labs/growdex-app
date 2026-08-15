"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface CTRChartProps {
  facebookData?: number[];
  tiktokData?: number[];
  size?: "card" | "hero";
}

export function CTRLineChart({
  facebookData,
  tiktokData,
  size = "card",
}: CTRChartProps) {
  const fb = facebookData?.filter(Number.isFinite) ?? [];
  const tt = tiktokData?.filter(Number.isFinite) ?? [];

  if (!fb.length && !tt.length) {
    return (
      <div
        className={`mt-6 flex items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-500 ${
          size === "hero" ? "h-72 md:h-80" : "h-48"
        }`}
      >
        No CTR history available yet.
      </div>
    );
  }

  // Transform data into format Recharts expects
  const longest = Math.max(fb.length, tt.length);
  const chartData = Array.from({ length: longest }, (_, index) => ({
    index,
    facebook: fb[index],
    tiktok: tt[index],
  }));

  return (
    <div className={size === "hero" ? "mt-6 h-72 md:h-80" : "mt-6 h-48"}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#E5E7EB"
            vertical={false}
          />

          <XAxis dataKey="index" hide={true} />

          <YAxis
            domain={[0, 100]}
            ticks={[20, 40, 60, 80, 100]}
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
            tickFormatter={(value) => `${value}%`}
            axisLine={false}
            tickLine={false}
          />

          {fb.length > 0 && (
            <Line
              type="monotone"
              dataKey="facebook"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={false}
              animationDuration={1000}
            />
          )}

          {tt.length > 0 && (
            <Line
              type="monotone"
              dataKey="tiktok"
              stroke="#1F2937"
              strokeWidth={2.5}
              dot={false}
              animationDuration={1000}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
