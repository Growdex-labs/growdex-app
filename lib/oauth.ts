import { SocialAccountSetupProps } from '@/types/social';
import { hydrateSocialAccounts } from './social';
import { API_BASE_URL, apiFetch } from './auth';

export type SocialPlatform = 'meta' | 'tiktok';

/**
 * Open the OAuth popup and resolve once the backend OAuth flow redirects to the
 * frontend callback. The backend owns the provider code exchange and connection;
 * the frontend refreshes onboarding status after the callback confirms success.
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

  // Backend builds the provider OAuth URL (scopes + state) and redirects.
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
    if (event.data?.platform !== platform) return;

    if (event.data?.type === 'oauth_success') {
      isCompleted = true;
      window.removeEventListener('message', messageHandler);
      popup.close();
      onSuccess();
    }

    if (event.data?.type === 'oauth_error') {
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
 * Connect a social account: run the OAuth popup, then refresh the backend social
 * setup once the callback reports success.
 */
export const connectSocialAccount = async (
  platform: SocialPlatform
): Promise<{ success: boolean; data?: SocialAccountSetupProps; error?: string }> => {
  const popupResult = await new Promise<{ success: boolean; error?: string }>((resolve) => {
    openOAuthPopup(
      platform,
      () => resolve({ success: true }),
      (error) => resolve({ success: false, error })
    );
  });

  if (!popupResult.success) {
    return { success: false, error: popupResult.error || `Failed to connect ${platform}` };
  }

  return hydrateSocialAccounts();
};

/**
 * Disconnect a platform
 */
export const disconnectSocialAccount = async (
  platform: SocialPlatform
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await apiFetch(`/users/onboarding/connections/${platform}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as {
        message?: unknown;
      };
      throw new Error(
        typeof body.message === "string" && body.message.trim()
          ? body.message
          : `Could not disconnect ${platform === "meta" ? "Meta" : "TikTok"} (${res.status}).`,
      );
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to disconnect',
    };
  }
};
