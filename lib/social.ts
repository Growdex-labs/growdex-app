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

export async function refreshSocialAccount(
  platform: 'meta' | 'tiktok',
): Promise<{
  success: boolean;
  data?: SocialAccountSetupProps;
  error?: string;
}> {
  try {
    const res = await apiFetch(`/users/onboarding/sync/${platform}`, {
      method: 'POST',
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        typeof data?.message === 'string'
          ? data.message
          : `Could not refresh ${platform}`;
      throw new Error(message);
    }
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : `Could not refresh ${platform}`,
    };
  }
}
