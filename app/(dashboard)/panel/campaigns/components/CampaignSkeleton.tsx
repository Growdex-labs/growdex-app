"use client";

interface CampaignSkeletonProps {
  className?: string;
}

export function CampaignSkeleton({ className = "" }: CampaignSkeletonProps) {
  return (
    <div
      aria-label="Loading campaign data"
      className={`relative h-16 overflow-hidden rounded-xl border border-gray-100 bg-gray-100 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-linear-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}

export default CampaignSkeleton;
