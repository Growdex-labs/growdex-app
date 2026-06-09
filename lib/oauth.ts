import { SocialAccountSetupProps } from '@/types/social';
import { API_BASE_URL, apiFetch } from './auth';

export type SocialPlatform = 'meta' | 'tiktok';

/**
 * Open OAuth popup window
 */
export const openOAuthPopup = (
  platform: SocialPlatform,
  onSuccess: () => void,
  onError: (error: string) => void
): Window | null => {
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  // Backend provides the OAuth URL
  const popup = window.open(
    `${API_BASE_URL}/auth/${platform}`,
    `${platform}_oauth`,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
  );

  if (!popup) {
    onError('Popup blocked. Please allow popups.');
    return null;
  }

  // Track completion to avoid race condition between manual close and message receipt
  let isCompleted = false;
  const allowedOrigins = new Set([
    window.location.origin,
    API_BASE_URL ? new URL(API_BASE_URL).origin : '',
  ]);

  const messageHandler = (event: MessageEvent) => {
    if (!allowedOrigins.has(event.origin)) return;

    if (event.data?.type === 'oauth_success' && event.data.platform === platform) {
      isCompleted = true;
      window.removeEventListener('message', messageHandler);
      popup.close();
      onSuccess();
    }

    if (event.data?.type === 'oauth_error' && event.data.platform === platform) {
      isCompleted = true;
      window.removeEventListener('message', messageHandler);
      popup.close();
      onError(event.data.error);
    }
  };

  window.addEventListener('message', messageHandler);

  const popupCheck = setInterval(() => {
    if (popup.closed) {
      clearInterval(popupCheck);
      window.removeEventListener('message', messageHandler);
      if (!isCompleted) {
        onError('Authentication cancelled');
      }
    }
  }, 500);

  return popup;
};

/**
 * Connect a social account via OAuth
 */
export const connectSocialAccount = async (
  platform: SocialPlatform
): Promise<{ success: boolean; data?: SocialAccountSetupProps; error?: string }> => {
  return new Promise((resolve) => {
    openOAuthPopup(
      platform,
      () => resolve({ success: true }),
      (error) => resolve({ success: false, error })
    );
  });
};

/**
 * Disconnect a platform
 */
export const disconnectSocialAccount = async (
  platform: SocialPlatform
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await apiFetch(`/users/onboarding/disconnect/${platform}`, {
      method: 'POST',
    });

    if (!res.ok) throw new Error('Failed to disconnect');

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to disconnect',
    };
  }
};
