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
}

const SAMPLE_FACEBOOK = [30, 55, 42, 48, 65, 70, 62, 68, 72];
const SAMPLE_TIKTOK = [50, 46, 58, 52, 62, 80, 70, 66, 78];

export function CTRLineChart({
  facebookData,
  tiktokData,
}: CTRChartProps) {
  const fb = facebookData && facebookData.length > 0 ? facebookData : SAMPLE_FACEBOOK;
  const tt = tiktokData && tiktokData.length > 0 ? tiktokData : SAMPLE_TIKTOK;

  // Transform data into format Recharts expects
  const longest = Math.max(fb.length, tt.length);
  const chartData = Array.from({ length: longest }, (_, index) => ({
    index,
    facebook: fb[index] ?? 0,
    tiktok: tt[index] ?? 0,
  }));

  return (
    <div className="mt-6 h-48">
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

          <Line
            type="monotone"
            dataKey="facebook"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={false}
            animationDuration={1000}
          />

          <Line
            type="monotone"
            dataKey="tiktok"
            stroke="#1F2937"
            strokeWidth={2.5}
            dot={false}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
