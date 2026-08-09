"use client";

export interface SegmentedTabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface SegmentedTabsProps<T extends string> {
  items: ReadonlyArray<SegmentedTabItem<T>>;
  value: T;
  onChange: (id: T) => void;
  /** Names the group for screen readers, e.g. "Campaign status". */
  label: string;
  className?: string;
}

/**
 * Segments size to their labels and the selection reads as a raised white
 * surface, which keeps the brand yellow free for the page's real action.
 */
export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  label,
  className = "",
}: SegmentedTabsProps<T>) {
  return (
    <div className={`flex ${className}`}>
      <div
        role="tablist"
        aria-label={label}
        className="hide-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-lg bg-lavender-50 p-1"
      >
        {items.map((item) => {
          const selected = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(item.id)}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-gilroy-medium transition-colors ${
                selected
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {item.label}
              {item.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                    selected
                      ? "bg-gray-100 text-gray-600"
                      : "bg-white/70 text-gray-500"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
