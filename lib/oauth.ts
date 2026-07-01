import { SocialAccountSetupProps } from '@/types/social';
import { API_BASE_URL, apiFetch } from './auth';

export type SocialPlatform = 'meta' | 'tiktok';

/**
 * Open the OAuth popup and resolve with the authorization code returned by the
 * provider. The popup navigates to the backend's `/auth/:platform` initiator
 * (which builds the provider URL + state and carries the session cookie); the
 * provider then redirects to the frontend `/oauth/:platform` callback, which
 * relays the code back here via postMessage.
 */
export const openOAuthPopup = (
  platform: SocialPlatform,
  onSuccess: (code: string) => void,
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

    if (event.data?.type === 'oauth_success' && event.data.code) {
      isCompleted = true;
      window.removeEventListener('message', messageHandler);
      popup.close();
      onSuccess(event.data.code as string);
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
 * Exchange an authorization code for a platform connection via the unified
 * onboarding endpoint. Returns the refreshed social setup on success.
 */
const exchangeCode = async (
  platform: SocialPlatform,
  code: string
): Promise<{ success: boolean; data?: SocialAccountSetupProps; error?: string }> => {
  try {
    const res = await apiFetch(`/users/onboarding/connect/${platform}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) throw new Error(`Failed to connect ${platform}`);

    const data: SocialAccountSetupProps = await res.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : `Failed to connect ${platform}`,
    };
  }
};

/**
 * Connect a social account: run the OAuth popup to obtain a code, then exchange
 * it for a connection through the backend.
 */
export const connectSocialAccount = async (
  platform: SocialPlatform
): Promise<{ success: boolean; data?: SocialAccountSetupProps; error?: string }> => {
  const code = await new Promise<{ code?: string; error?: string }>((resolve) => {
    openOAuthPopup(
      platform,
      (code) => resolve({ code }),
      (error) => resolve({ error })
    );
  });

  if (!code.code) {
    return { success: false, error: code.error || `Failed to connect ${platform}` };
  }

  return exchangeCode(platform, code.code);
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
