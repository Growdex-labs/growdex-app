"use client";

interface DonutChartProps {
  meta: number;
  tiktok: number;
}

export function DonutChart({ meta, tiktok }: DonutChartProps) {
  const total = meta + tiktok;

  // Calculate percentages and angles
  const metaPercent = total > 0 ? (meta / total) * 100 : 0;
  const tiktokPercent = total > 0 ? (tiktok / total) * 100 : 0;

  // Calculate cumulative angles for SVG arc
  const radius = 80;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  const metaDashArray = `${(metaPercent / 100) * circumference} ${circumference}`;
  const tiktokDashArray = `${(tiktokPercent / 100) * circumference} ${circumference}`;

  const metaRotation = -90;
  const tiktokRotation = metaRotation + (metaPercent / 100) * 360;

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="flex flex-col items-center">
      {/* Donut Chart */}
      <div className="relative w-48 h-48 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* TikTok segment (light gray/blue) */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#C4B5A0"
            strokeWidth={strokeWidth}
            strokeDasharray={tiktokDashArray}
            strokeLinecap="round"
            style={{
              transform: `rotate(${tiktokRotation}deg)`,
              transformOrigin: "center",
            }}
          />

          {/* Facebook segment (dark olive) */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#4A5D23"
            strokeWidth={strokeWidth}
            strokeDasharray={metaDashArray}
            strokeLinecap="round"
            style={{
              transform: `rotate(${metaRotation}deg)`,
              transformOrigin: "center",
            }}
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4A5D23]"></div>
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="text-gray-600">{formatNumber(meta)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#C4B5A0]"></div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
            <span className="text-gray-600">{formatNumber(tiktok)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
