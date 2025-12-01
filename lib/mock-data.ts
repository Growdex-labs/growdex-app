// Mock data for panel dashboard development and testing

interface WalletTransaction {
  id: string;
  date: string;
  type: string;
  amount: string;
  status: 'Success' | 'Failed' | 'Pending';
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
  platforms: ('facebook' | 'instagram' | 'tiktok')[];
  started: string;
  impressions: number;
  reach: { min: number; max: number };
  ctr: number;
  ctrTrend: number; // percentage change
  status: 'active' | 'paused' | 'suspended' | 'scheduled';
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
  budgetBurn: 'normal' | 'warning' | 'critical';
  totalSpent: number;
  costPerConversion: { value: number; trend: number };
  costPerClick: { value: number; trend: number };
  audienceReception: { value: string; trend: number };
  clickThroughRate: { facebook: number; tiktok: number; trend: number };
  totalImpressions: number;
}

// Mock user data
export const mockUser = {
  name: 'Tunmi Lawal',
  email: 'tunmi@example.com',
  avatar: '/avatar.png',
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
    id: '1',
    name: 'Growdex ONE uP',
    platforms: ['tiktok', 'facebook'],
    started: '28-06-2025',
    impressions: 50000,
    reach: { min: 16000, max: 23000 },
    ctr: 35.7,
    ctrTrend: -35.7,
    status: 'active',
  },
  {
    id: '2',
    name: 'Summer Sale Campaign',
    platforms: ['instagram', 'facebook'],
    started: '15-06-2025',
    impressions: 75000,
    reach: { min: 25000, max: 35000 },
    ctr: 42.3,
    ctrTrend: 12.5,
    status: 'active',
  },
  {
    id: '3',
    name: 'Product Launch 2025',
    platforms: ['tiktok'],
    started: '01-06-2025',
    impressions: 120000,
    reach: { min: 45000, max: 60000 },
    ctr: 28.9,
    ctrTrend: -8.2,
    status: 'paused',
  },
];

// Mock chart data
export const mockChartData: ChartDataPoint[] = [
  { date: '21-09-2025', facebook: 5000000, instagram: 8000000, tiktok: 10000000 },
  { date: '21-09-2025', facebook: 7000000, instagram: 12000000, tiktok: 14000000 },
  { date: '21-09-2025', facebook: 9000000, instagram: 10000000, tiktok: 11000000 },
  { date: '21-09-2025', facebook: 11000000, instagram: 14000000, tiktok: 15000000 },
  { date: '21-09-2025', facebook: 13000000, instagram: 16000000, tiktok: 18000000 },
];

// Mock dashboard metrics
export const mockDashboardMetrics: DashboardMetrics = {
  campaigns: mockCampaignMetrics,
  topPerformer: {
    name: 'Campaign Test',
    cpa: 35.7,
    cpaTrend: 35.7,
  },
  budgetBurn: 'critical',
  totalSpent: 11567980.98,
  costPerConversion: { value: 1300.8, trend: -35.7 },
  costPerClick: { value: 350.89, trend: -35.7 },
  audienceReception: { value: 'Negative', trend: -35.7 },
  clickThroughRate: { facebook: 7, tiktok: 7, trend: -35.7 },
  totalImpressions: 12900345,
};

// Helper function to get time-based greeting
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  } else if (hour >= 17 && hour < 22) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
};

// Helper to format currency
export const formatCurrency = (amount: number): string => {
  return `N${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper to format number with commas
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};


// Mock wallet transaction data
export const mockWalletTransactions: WalletTransaction[] = [
  { id: 'Growdex ONE uP', date: '28-06-2025', type: 'Deposit', amount: '16,900 - 23,000', status: 'Failed' },
  { id: 'Growdex ONE uP', date: '28-06-2025', type: 'Deposit', amount: '₦56,789.00', status: 'Success' },
  { id: 'Growdex ONE uP', date: '28-06-2025', type: 'Withdrawal', amount: '16,900 - 23,000', status: 'Pending' },
  { id: 'Growdex ONE uP', date: '28-06-2025', type: '16,900 - 23,000', amount: '16,900 - 23,000', status: 'Success' },
  { id: 'Growdex ONE uP', date: '28-06-2025', type: '16,900 - 23,000', amount: '16,900 - 23,000', status: 'Pending' },
];
