// Onboarding utilities for tracking and persisting onboarding data

import { apiFetch } from './auth';

export interface OnboardingData {
  personalInfo: {
    name: string;
    email: string;
    organizationName: string;
    organizationSize: string;
  };
  socialAccounts?: {
    facebook?: boolean;
    instagram?: boolean;
    tiktok?: boolean;
  };
  completed: boolean;
  completedAt?: string;
}

const ONBOARDING_STATUS_KEY = 'onboarding_status';

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
    const response = await apiFetch('/onboarding/status');

    if (!response.ok) {
      throw new Error('Failed to fetch onboarding status');
    }

    const data = await response.json();

    // Update local storage
    if (data.completed) {
      markOnboardingComplete();
    } else {
      clearOnboardingStatus();
    }

    return {
      success: true,
      completed: data.completed,
      data: data.onboarding,
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
  organizationSize: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    // get country code from the browser
    const countryCode = navigator.language.split('-')[1];
    const response = await apiFetch('/users/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data, countryCode }),
    });

    if (!response.ok) {
      throw new Error('Failed to save personal information');
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save data',
    };
  }
};

/**
 * Complete onboarding and save to backend
 */
export const completeOnboarding = async (data?: {
  skipSocialAccounts?: boolean;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await apiFetch('/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });

    if (!response.ok) {
      throw new Error('Failed to complete onboarding');
    }

    // Mark as complete locally
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
export const getOnboardingProgress = async (): Promise<{
  success: boolean;
  progress?: {
    currentStep: number;
    stepsCompleted: string[];
    personalInfoSaved: boolean;
    socialAccountsConnected: number;
  };
  error?: string;
}> => {
  try {
    const response = await apiFetch('/onboarding/progress');

    if (!response.ok) {
      throw new Error('Failed to fetch progress');
    }

    const data = await response.json();
    return { success: true, progress: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch progress',
    };
  }
};
