"use client";

interface CampaignSkeletonProps {
  className?: string;
}

/**
 * Animated loading placeholder shown while the AI builds the campaign.
 * A gray card with a bright highlight band sweeping across it.
 */
export function CampaignSkeleton({ className = "" }: CampaignSkeletonProps) {
  return (
    <div
      className={`relative h-16 w-1/2 overflow-hidden rounded-md border border-gray-100 bg-gray-100 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-linear-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}

export default CampaignSkeleton;
