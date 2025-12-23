// Mock data for panel dashboard development and testing

interface WalletTransaction {
  id: string;
  date: string;
  type: string;
  amount: string;
  status: "Success" | "Failed" | "Pending";
}

export interface CampaignMetrics {
  active: number;
  paused: number;
  suspended: number;
  drafts: number;
}

export interface Campaign {
  id: string;
  name: string;
  platforms: ("facebook" | "instagram" | "tiktok")[];
  started: string;
  impressions: number;
  reach: { min: number; max: number };
  ctr: number;
  ctrTrend: number; // percentage change
  status: "active" | "paused" | "suspended" | "scheduled";
  adsCount?: number;
  description?: string;
  goal?: string;
  optimizationPercentage?: number;
}

export interface ChartDataPoint {
  date: string;
  facebook: number;
  instagram: number;
  tiktok: number;
}

export interface DashboardMetrics {
  campaigns: CampaignMetrics;
  topPerformer: {
    name: string;
    cpa: number;
    cpaTrend: number;
  };
  budgetBurn: "normal" | "warning" | "critical";
  totalSpent: number;
  costPerConversion: { value: number; trend: number };
  costPerClick: { value: number; trend: number };
  audienceReception: { value: string; trend: number };
  clickThroughRate: { facebook: number; tiktok: number; trend: number };
  totalImpressions: number;
}

// Ads interface
export interface Ad {
  id: string;
  name: string;
  campaignId: string;
  platform: "facebook" | "instagram" | "tiktok";
  status: "active" | "paused" | "draft";
  headline?: string;
  caption: string;
  creative: {
    type: "image" | "video";
    url: string;
    thumbnailUrl?: string;
  };
  brandName: string;
  brandLogo: string;
  callToAction?: string;
  createdAt: string;
}

// Mock ads data
export const mockAds: Ad[] = [
  {
    id: "ad-1",
    name: "Ad 1",
    campaignId: "1",
    platform: "facebook",
    status: "draft",
    headline: "5,000 things you need to be successful",
    caption:
      "We'd love to hear from you.\nWhether you have questions about upcoming events, partnership opportunities, volunteering, or testimonies to share — our team is ready to connect with you. Night of Glory isn't just an event; it's a family of believers united by one vision: to see God's glory fill the earth.\n\nReach out to us today — we're here to pray with you, guide you, and help you be part of what God is doing through this movement.",
    creative: {
      type: "image",
      url: "/ads/bero-speaker.jpg",
      thumbnailUrl: "/ads/bero-speaker.jpg",
    },
    brandName: "Growdex Limited",
    brandLogo: "/logo.png",
    callToAction: "Learn More",
    createdAt: "2025-11-28",
  },
  {
    id: "ad-2",
    name: "Ad 2",
    campaignId: "1",
    platform: "facebook",
    status: "active",
    headline: "Unlock Your Potential Today",
    caption:
      "Join thousands who have transformed their lives with our program. Discover proven strategies for personal and professional growth.",
    creative: {
      type: "image",
      url: "/ads/success-image.jpg",
    },
    brandName: "Growdex Limited",
    brandLogo: "/logo.png",
    callToAction: "Sign Up Now",
    createdAt: "2025-11-25",
  },
  {
    id: "ad-3",
    name: "TikTok Ad 1",
    campaignId: "1",
    platform: "tiktok",
    status: "active",
    headline: "Transform Your Business in 2025",
    caption:
      "Ready to scale? 🚀\nOur platform helps businesses grow 10x faster.\n\n#BusinessGrowth #Marketing #Success",
    creative: {
      type: "video",
      url: "/ads/tiktok-video.mp4",
      thumbnailUrl: "/ads/tiktok-thumb.jpg",
    },
    brandName: "Growdex Limited",
    brandLogo: "/logo.png",
    callToAction: "Download Now",
    createdAt: "2025-11-20",
  },
];

// Mock user data
export const mockUser = {
  name: "Tunmi Lawal",
  email: "tunmi@example.com",
  avatar: "/avatar.png",
};

// Mock campaign metrics
export const mockCampaignMetrics: CampaignMetrics = {
  active: 10,
  paused: 10,
  suspended: 12,
  drafts: 8,
};

// Mock campaigns data
export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Growdex ONE uP",
    platforms: ["tiktok", "facebook"],
    started: "28-06-2025",
    impressions: 50000,
    reach: { min: 16000, max: 23000 },
    ctr: 35.7,
    ctrTrend: -35.7,
    status: "active",
    description:
      "Promoting the Growdex ONE uP product to increase brand awareness and drive sales.",
    goal: "Sales",
    adsCount: 5,
    optimizationPercentage: 75,
  },
  {
    id: "2",
    name: "Summer Sale Campaign",
    platforms: ["instagram", "facebook"],
    started: "15-06-2025",
    impressions: 75000,
    reach: { min: 25000, max: 35000 },
    ctr: 42.3,
    ctrTrend: 12.5,
    status: "active",
    description: "Promoting the Summer Sale Campaign to boost seasonal sales.",
    goal: "Conversions",
    adsCount: 8,
    optimizationPercentage: 60,
  },
  {
    id: "3",
    name: "Product Launch 2025",
    platforms: ["tiktok"],
    started: "01-06-2025",
    impressions: 120000,
    reach: { min: 45000, max: 60000 },
    ctr: 28.9,
    ctrTrend: -8.2,
    status: "paused",
    description: "Launching the new product line for 2025 with targeted ads.",
    goal: "Leads",
    adsCount: 10,
    optimizationPercentage: 80,
  },
  {
    id: "6",
    name: "Growdex ONE uP",
    platforms: ["tiktok", "facebook"],
    started: "28-06-2025",
    impressions: 50000,
    reach: { min: 16900, max: 23000 },
    ctr: 35.7,
    ctrTrend: -35.7,
    status: "suspended",
    description: "Campaign suspended due to policy violation.",
    goal: "Sales",
    adsCount: 5,
    optimizationPercentage: 75,
  },
  {
    id: "4",
    name: "Scheduled Campaign",
    platforms: ["facebook", "instagram"],
    started: "12-09-2025",
    impressions: 0,
    reach: { min: 0, max: 0 },
    ctr: 0,
    ctrTrend: 0,
    status: "scheduled",
    description: "Upcoming campaign scheduled for launch in December 2025.",
    goal: "Brand Awareness",
    adsCount: 6,
    optimizationPercentage: 0,
  },
  {
    id: "5",
    name: "Holiday Season Promo",
    platforms: ["tiktok", "instagram"],
    started: "20-12-2025",
    impressions: 0,
    reach: { min: 0, max: 0 },
    ctr: 0,
    ctrTrend: 0,
    status: "scheduled",
    description:
      "Holiday promotional campaign targeting year-end shopping season.",
    goal: "Sales",
    adsCount: 4,
    optimizationPercentage: 0,
  },
];

// Mock chart data
export const mockChartData: ChartDataPoint[] = [
  {
    date: "21-09-2025",
    facebook: 5000000,
    instagram: 8000000,
    tiktok: 10000000,
  },
  {
    date: "21-09-2025",
    facebook: 7000000,
    instagram: 12000000,
    tiktok: 14000000,
  },
  {
    date: "21-09-2025",
    facebook: 9000000,
    instagram: 10000000,
    tiktok: 11000000,
  },
  {
    date: "21-09-2025",
    facebook: 11000000,
    instagram: 14000000,
    tiktok: 15000000,
  },
  {
    date: "21-09-2025",
    facebook: 13000000,
    instagram: 16000000,
    tiktok: 18000000,
  },
];

// Mock dashboard metrics
export const mockDashboardMetrics: DashboardMetrics = {
  campaigns: mockCampaignMetrics,
  topPerformer: {
    name: "Campaign Test",
    cpa: 35.7,
    cpaTrend: 35.7,
  },
  budgetBurn: "critical",
  totalSpent: 11567980.98,
  costPerConversion: { value: 1300.8, trend: -35.7 },
  costPerClick: { value: 350.89, trend: -35.7 },
  audienceReception: { value: "Negative", trend: -35.7 },
  clickThroughRate: { facebook: 7, tiktok: 7, trend: -35.7 },
  totalImpressions: 12900345,
};

// Helper function to get time-based greeting
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 22) {
    return "Good evening";
  } else {
    return "Good night";
  }
};

// Helper to format currency
export const formatCurrency = (amount: number): string => {
  return `N${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Helper to format number with commas
export const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US");
};

// Helper function to get ads for a specific campaign
export const getAdsByCampaignId = (campaignId: string): Ad[] => {
  return mockAds.filter((ad) => ad.campaignId === campaignId);
};

// Budget interface and mock data
export interface Budget {
  id: string;
  name: string;
  campaignId: string;
  icon: string;
  status: "running" | "paused" | "suspended" | "completed";
  usedPercent: number;
  amount: number;
  isActive: boolean;
  createdAt: string;
  facebookBudget: {
    amount: number;
    frequency: "daily" | "weekly" | "monthly";
    reach: { min: number; max: number };
  };
  tiktokBudget: {
    amount: number;
    frequency: "daily" | "weekly" | "monthly";
    reach: { min: number; max: number };
  };
  pauseOnBudgetReached: boolean;
}

export const mockBudgets: Budget[] = [
  {
    id: "1",
    name: "Election Budget",
    campaignId: "1",
    icon: "/ic_baseline-plus.png",
    status: "running",
    usedPercent: 20,
    amount: 135000,
    isActive: true,
    createdAt: "2025-11-28",
    facebookBudget: {
      amount: 5000,
      frequency: "daily",
      reach: { min: 25000, max: 70000 },
    },
    tiktokBudget: {
      amount: 7000,
      frequency: "daily",
      reach: { min: 25000, max: 70000 },
    },
    pauseOnBudgetReached: false,
  },
  {
    id: "2",
    name: "Marketing Campaign",
    campaignId: "2",
    icon: "/ic_baseline-plus.png",
    status: "running",
    usedPercent: 65,
    amount: 250000.0,
    isActive: true,
    createdAt: "2025-11-20",
    facebookBudget: {
      amount: 8000,
      frequency: "daily",
      reach: { min: 30000, max: 80000 },
    },
    tiktokBudget: {
      amount: 10000,
      frequency: "daily",
      reach: { min: 35000, max: 90000 },
    },
    pauseOnBudgetReached: true,
  },
  {
    id: "3",
    name: "Product Launch",
    campaignId: "3",
    icon: "/ic_baseline-plus.png",
    status: "paused",
    usedPercent: 45,
    amount: 180000.0,
    isActive: false,
    createdAt: "2025-11-15",
    facebookBudget: {
      amount: 6000,
      frequency: "daily",
      reach: { min: 20000, max: 60000 },
    },
    tiktokBudget: {
      amount: 6500,
      frequency: "daily",
      reach: { min: 22000, max: 65000 },
    },
    pauseOnBudgetReached: false,
  },
];

// Helper function to get budget by ID
export const getBudgetById = (budgetId: string): Budget | undefined => {
  return mockBudgets.find((budget) => budget.id === budgetId);
};

// Mock wallet transaction data
export const mockWalletTransactions: WalletTransaction[] = [
  {
    id: "Growdex ONE uP",
    date: "28-06-2025",
    type: "Deposit",
    amount: "16,900 - 23,000",
    status: "Failed",
  },
  {
    id: "Growdex ONE uP",
    date: "28-06-2025",
    type: "Deposit",
    amount: "₦56,789.00",
    status: "Success",
  },
  {
    id: "Growdex ONE uP",
    date: "28-06-2025",
    type: "Withdrawal",
    amount: "16,900 - 23,000",
    status: "Pending",
  },
  {
    id: "Growdex ONE uP",
    date: "28-06-2025",
    type: "16,900 - 23,000",
    amount: "16,900 - 23,000",
    status: "Success",
  },
  {
    id: "Growdex ONE uP",
    date: "28-06-2025",
    type: "16,900 - 23,000",
    amount: "16,900 - 23,000",
    status: "Pending",
  },
];
