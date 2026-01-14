import { apiFetch } from '@/lib/auth';
import { SocialAccountSetupProps } from '@/types/social';

export async function hydrateSocialAccounts(): Promise<{
  success: boolean;
  data?: SocialAccountSetupProps;
  error?: string;
}> {
  try {
    const res = await apiFetch('/users/onboarding/status');

    if (!res.ok) {
      throw new Error('Failed to fetch social setup');
    }

    const data = await res.json();

    return {
      success: true,
      data,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
