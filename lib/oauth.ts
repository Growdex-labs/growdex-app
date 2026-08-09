import { SocialAccountSetupProps } from '@/types/social';
import { API_BASE_URL, apiFetch } from './auth';
import { hydrateSocialAccounts } from './social';

export type SocialPlatform = 'meta' | 'tiktok';

/**
 * Open the OAuth popup and resolve with the authorization code returned by the
 * provider. The backend starts the provider flow; the frontend callback relays
 * the returned code so the backend can finish and save the connection.
 */
export const openOAuthPopup = (
  platform: SocialPlatform,
  onSuccess: (code?: string) => void,
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
      const code =
        typeof event.data.code === 'string' && event.data.code.trim()
          ? event.data.code
          : undefined;
      onSuccess(code);
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
 * Send the provider authorization code to the backend so it can exchange the
 * code, save the connection, and return the connected account state.
 */
export const exchangeSocialAuthorizationCode = async (
  platform: SocialPlatform,
  code: string,
): Promise<{ success: boolean; data?: SocialAccountSetupProps; error?: string }> => {
  try {
    const response = await apiFetch(`/users/onboarding/connect/${platform}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        typeof body?.message === 'string' && body.message.trim()
          ? body.message
          : `Could not connect ${platform === 'meta' ? 'Meta' : 'TikTok'} (${response.status}).`;
      return { success: false, error: message };
    }

    const data = body as SocialAccountSetupProps | null;
    if (!data?.[platform]?.connected) {
      return {
        success: false,
        error: `${platform === 'meta' ? 'Meta' : 'TikTok'} authorization completed, but the connected account was not saved. Please try again.`,
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : `Could not connect ${platform === 'meta' ? 'Meta' : 'TikTok'}.`,
    };
  }
};

/**
 * Connect a social account by collecting the provider code and asking the
 * backend to exchange and save it.
 */
export const connectSocialAccount = async (
  platform: SocialPlatform
): Promise<{ success: boolean; data?: SocialAccountSetupProps; error?: string }> => {
  const popupResult = await new Promise<{
    completed?: boolean;
    code?: string;
    error?: string;
  }>((resolve) => {
    openOAuthPopup(
      platform,
      (code) => resolve({ completed: true, code }),
      (error) => resolve({ error })
    );
  });

  if (!popupResult.completed) {
    return { success: false, error: popupResult.error || `Failed to connect ${platform}` };
  }

  // Current backend callbacks exchange and save the provider code before
  // notifying this window. Older callbacks relay the code for this client to
  // exchange, so keep that path working as well.
  if (popupResult.code) {
    return exchangeSocialAuthorizationCode(platform, popupResult.code);
  }

  const accounts = await hydrateSocialAccounts();
  if (accounts.success && accounts.data?.[platform]?.connected) {
    return { success: true, data: accounts.data };
  }

  return {
    success: false,
    error:
      accounts.error ||
      `${platform === 'meta' ? 'Meta' : 'TikTok'} authorization completed, but Growdex could not reload the saved connection. Refresh the page and try again.`,
  };
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
