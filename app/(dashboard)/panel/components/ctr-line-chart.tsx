'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface CTRChartProps {
  facebookData?: number[];
  tiktokData?: number[];
}

export function CTRLineChart({
  facebookData = [30, 65, 45, 70, 55, 80, 60, 55, 70, 85],
  tiktokData = [50, 45, 65, 40, 75, 35, 55, 80, 55, 85]
}: CTRChartProps) {

  // Transform data into format Recharts expects
  const chartData = facebookData.map((fbValue, index) => ({
    index,
    facebook: fbValue,
    tiktok: tiktokData[index] || 0
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

          <XAxis
            dataKey="index"
            hide={true}
          />

          <YAxis
            domain={[0, 100]}
            ticks={[20, 40, 60, 80, 100]}
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
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
