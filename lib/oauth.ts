import { SocialAccountSetupProps } from '@/types/social';
import { API_BASE_URL, apiFetch } from './auth';

export type SocialPlatform = 'meta' | 'tiktok';

/**
 * Open OAuth popup window
 */
export const openOAuthPopup = (
  platform: SocialPlatform,
  onSuccess: (data: { code: string }) => void,
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

  const messageHandler = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;

    if (event.data?.type === 'oauth_success' && event.data.platform === platform) {
      isCompleted = true;
      window.removeEventListener('message', messageHandler);
      popup.close();
      onSuccess({ code: event.data.code });
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

export const testConnectSocialAccount = async (platform: SocialPlatform) => {
  const res = await apiFetch('/users/onboarding/connect/' + platform, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: 'test' }),
  });

  if (!res.ok) {
    throw new Error('Failed to connect account');
  }

  const data = await res.json();
  return data;
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
      async ({ code }) => {
        try {
          const response = await apiFetch(
            `/users/onboarding/connect/${platform}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ code }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to connect account');
          }

          const data = await response.json();
          resolve({ success: true, data });
        } catch (err) {
          resolve({
            success: false,
            error: err instanceof Error ? err.message : 'OAuth failed',
          });
        }
      },
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
