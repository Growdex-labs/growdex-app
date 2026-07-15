"use client";

import { MetaIcon, InstagramIcon, TikTokIcon } from "./platform-icons";

interface DonutChartProps {
  meta: number;
  instagram?: number;
  tiktok: number;
}

const COLORS = {
  meta: "#332c00",
  instagram: "#d6c34a",
  tiktok: "#fff8ce",
};

export function DonutChart({ meta, instagram = 0, tiktok }: DonutChartProps) {
  const total = meta + instagram + tiktok;

  const radius = 80;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { key: "meta", value: meta, color: COLORS.meta },
    { key: "instagram", value: instagram, color: COLORS.instagram },
    { key: "tiktok", value: tiktok, color: COLORS.tiktok },
  ];

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const fraction = total > 0 ? seg.value / total : 0;
    const dash = `${fraction * circumference} ${circumference}`;
    const rotation = -90 + cumulative * 360;
    cumulative += fraction;
    return { ...seg, dash, rotation };
  });

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="flex flex-col items-center">
      {/* Donut Chart */}
      <div className="relative w-44 h-44 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {arcs.map((arc) => (
            <circle
              key={arc.key}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={arc.dash}
              strokeLinecap="round"
              style={{
                transform: `rotate(${arc.rotation}deg)`,
                transformOrigin: "center",
              }}
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: COLORS.meta }} />
          <MetaIcon className="w-4 h-4" />
          <span className="text-[#9095a7] font-gilroy-light text-xs">
            {formatNumber(meta)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: COLORS.instagram }} />
          <InstagramIcon className="w-4 h-4" />
          <span className="text-[#9095a7] font-gilroy-light text-xs">
            {formatNumber(instagram)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: COLORS.tiktok }} />
          <TikTokIcon className="w-4 h-4" />
          <span className="text-[#9095a7] font-gilroy-light text-xs">
            {formatNumber(tiktok)}
          </span>
        </div>
      </div>
    </div>
  );
}
