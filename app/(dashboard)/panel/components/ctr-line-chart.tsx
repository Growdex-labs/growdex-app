"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface ChartSeries {
  key: string;
  color: string;
  data: number[];
}

interface CTRChartProps {
  facebookData?: number[];
  tiktokData?: number[];
  /** Named series; takes precedence over the legacy platform arrays. */
  series?: ChartSeries[];
  size?: "card" | "hero";
}

export function CTRLineChart({
  facebookData,
  tiktokData,
  series,
  size = "card",
}: CTRChartProps) {
  const namedSeries: ChartSeries[] =
    series ??
    [
      facebookData ? { key: "facebook", color: "#3B82F6", data: facebookData } : null,
      tiktokData ? { key: "tiktok", color: "#1F2937", data: tiktokData } : null,
    ].filter((entry): entry is ChartSeries => entry !== null);

  const usable = namedSeries.filter((entry) =>
    entry.data.some(Number.isFinite),
  );

  if (!usable.length) {
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

  const longest = Math.max(...usable.map((entry) => entry.data.length));
  const chartData = Array.from({ length: longest }, (_, index) => ({
    index,
    ...Object.fromEntries(
      usable.map((entry) => [entry.key, entry.data[index]]),
    ),
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

          {usable.map((entry) => (
            <Line
              key={entry.key}
              type="monotone"
              dataKey={entry.key}
              stroke={entry.color}
              strokeWidth={2.5}
              dot={false}
              animationDuration={1000}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
