// Onboarding utilities for tracking and persisting onboarding data

import { SocialAccountSetupProps } from '@/types/social';
import { apiFetch } from './auth';

export interface OnboardingData {
  personalInfo: {
    name: string;
    email: string;
    organizationName: string;
    organizationSize: string;
    industry?: string;
    monthlyBudget?: string;
  };
  business?: {
    businessName?: string;
    website?: string;
    advertisingBudget?: string;
    industry?: string;
    country?: string;
  } | null;
  goals?: {
    selected?: string[];
    custom?: string;
  } | null;
  socialAccounts?: SocialAccountSetupProps;
  completed: boolean;
  completedAt?: string;
}

/** Shape returned by GET /users/onboarding/status. */
interface OnboardingStatusResponse extends SocialAccountSetupProps {
  profile?: {
    firstName: string;
    lastName: string;
    organizationName: string;
    organizationSize: number;
    industry?: string | null;
    monthlyBudget?: string | null;
  } | null;
  business?: {
    businessName?: string | null;
    website?: string | null;
    advertisingBudget?: string | null;
    industry?: string | null;
    country?: string | null;
  } | null;
  goals?: {
    selected?: string[] | null;
    custom?: string | null;
  } | null;
}

const ONBOARDING_STATUS_KEY = 'onboarding_status';

const readApiError = async (response: Response, fallback: string) => {
  try {
    const body = await response.json();
    if (typeof body?.message === 'string') return body.message;
    if (Array.isArray(body?.message)) return body.message.join(', ');
    if (Array.isArray(body?.errors) && body.errors.length > 0) {
      return body.errors
        .map((error: { field?: string; message?: string }) =>
          error.field ? `${error.field}: ${error.message}` : error.message
        )
        .filter(Boolean)
        .join(', ');
    }
  } catch {}

  return fallback;
};

/**
 * Check if user has completed onboarding
 */
export const isOnboardingComplete = (): boolean => {
  if (typeof window === 'undefined') return false;

  const status = sessionStorage.getItem(ONBOARDING_STATUS_KEY);
  return status === 'complete';
};

/**
 * Mark onboarding as complete locally
 */
export const markOnboardingComplete = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ONBOARDING_STATUS_KEY, 'complete');
};

/**
 * Clear onboarding status
 */
export const clearOnboardingStatus = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ONBOARDING_STATUS_KEY);
};

/**
 * Fetch onboarding status from backend
 */
export const fetchOnboardingStatus = async (): Promise<{
  success: boolean;
  completed?: boolean;
  data?: OnboardingData;
  error?: string;
}> => {
  try {
    const response = await apiFetch('/users/onboarding/status');

    if (!response.ok) {
      throw new Error('Failed to fetch onboarding status');
    }

    const result: OnboardingStatusResponse = await response.json();

    // Update local storage
    if (result.meta?.connected && result.tiktok?.connected) {
      markOnboardingComplete();
    } else {
      clearOnboardingStatus();
    }

    const completed = !!(result.meta?.connected && result.tiktok?.connected);

    const fullName = result.profile
      ? `${result.profile.firstName ?? ''} ${result.profile.lastName ?? ''}`.trim()
      : '';

    const onboardingData: OnboardingData = {
      personalInfo: {
        name: fullName,
        email: '',
        organizationName: result.profile?.organizationName ?? '',
        organizationSize: String(result.profile?.organizationSize ?? ''),
        industry: result.profile?.industry ?? undefined,
        monthlyBudget: result.profile?.monthlyBudget ?? undefined,
      },
      business: result.business
        ? {
            businessName: result.business.businessName ?? undefined,
            website: result.business.website ?? undefined,
            advertisingBudget: result.business.advertisingBudget ?? undefined,
            industry: result.business.industry ?? undefined,
            country: result.business.country ?? undefined,
          }
        : null,
      goals: result.goals
        ? {
            selected: result.goals.selected ?? [],
            custom: result.goals.custom ?? undefined,
          }
        : null,
      socialAccounts: result,
      completed,
    };

    return {
      success: true,
      completed,
      data: onboardingData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch status',
    };
  }
};

/**
 * Save personal information (Step 1)
 */
export const savePersonalInfo = async (data: {
  firstName: string;
  lastName: string;
  organizationName: string;
  organizationSize: number;
  industry?: string;
  monthlyBudget?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await apiFetch('/users/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data }),
    });

    if (!response.ok) throw new Error(await readApiError(response, 'Failed to save personal information'));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save data',
    };
  }
};

/**
 * Save business information (Step 2)
 */
export const saveBusinessInfo = async (data: {
  businessName?: string;
  website?: string;
  advertisingBudget?: string;
  industry?: string;
  country?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await apiFetch('/users/onboarding/business', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data }),
    });

    if (!response.ok) throw new Error(await readApiError(response, 'Failed to save business information'));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save business info',
    };
  }
};

/**
 * Save marketing goals (Step 3)
 */
export const saveMarketingGoals = async (data: {
  goals: string[];
  customGoal?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await apiFetch('/users/onboarding/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data }),
    });

    if (!response.ok) throw new Error(await readApiError(response, 'Failed to save marketing goals'));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save goals',
    };
  }
};

/**
 * Complete onboarding and persist the flag to the backend.
 */
export const completeOnboarding = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await apiFetch('/users/onboarding/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Failed to complete onboarding'));
    }

    markOnboardingComplete();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete onboarding',
    };
  }
};

/**
 * Skip onboarding (mark as incomplete but allow dashboard access)
 */
export const skipOnboarding = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Mark as complete locally to allow dashboard access
    markOnboardingComplete();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to skip onboarding',
    };
  }
};

/**
 * Get onboarding progress
 */
// export const getOnboardingProgress = async (): Promise<{
//   success: boolean;
//   progress?: {
//     currentStep: number;
//     stepsCompleted: string[];
//     personalInfoSaved: boolean;
//     socialAccountsConnected: number;
//   };
//   error?: string;
// }> => {
//   try {
//     const response = await apiFetch('/onboarding/progress');

//     if (!response.ok) {
//       throw new Error('Failed to fetch progress');
//     }

//     const data = await response.json();
//     return { success: true, progress: data };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Failed to fetch progress',
//     };
//   }
// };
