"use client";

interface CampaignTrendLineProps {
  /** Click through rate per day, oldest day first. */
  values: number[];
  label: string;
}

type Point = { x: number; y: number };

const WIDTH = 40;
const HEIGHT = 14;

/** Under this much movement across the fortnight, a rate is holding, not turning. */
const FLAT = 0.05;

/** Half the stroke, so the best and worst days are not clipped. */
const PADDING = 2;

const plot = (values: number[]): Point[] => {
  const high = Math.max(...values);
  const low = Math.min(...values);
  const span = high - low;
  const usable = HEIGHT - PADDING * 2;
  const step = WIDTH / (values.length - 1);

  return values.map((value, index) => ({
    x: index * step,
    // A run of equal days has no span to scale against, so it rides mid height
    // rather than pinning to the floor.
    y:
      span > 0
        ? PADDING + usable - ((value - low) / span) * usable
        : PADDING + usable / 2,
  }));
};

/** Each day meets the next through its midpoint, so the days read as one movement. */
const curveThrough = (points: Point[]) =>
  points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const midX = (previous.x + point.x) / 2;
    return `${path} C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, "");

/**
 * The fortnight behind a rate, drawn beside the rate itself. Where the line
 * ends against where it began is the whole reading, so it carries the colour
 * of its own direction and needs no axis.
 */
export function CampaignTrendLine({ values, label }: CampaignTrendLineProps) {
  if (values.length < 2) return null;

  const points = plot(values);
  const first = values[0];
  const last = values[values.length - 1];
  const move = first > 0 ? (last - first) / first : 0;
  const tone =
    Math.abs(move) < FLAT
      ? "text-lavender-200"
      : move > 0
        ? "text-emerald-500"
        : "text-firebrick-400";

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={label}
      className={`h-3.5 w-10 shrink-0 ${tone}`}
    >
      <path
        d={curveThrough(points)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={points[points.length - 1].x - 1}
        cy={points[points.length - 1].y}
        r={1.6}
        fill="currentColor"
      />
    </svg>
  );
}

export default CampaignTrendLine;
