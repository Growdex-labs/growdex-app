import { SocialAccountSetupProps } from '@/types/social';
import { readApiErrorMessage, readResponseError } from './api-error';
import { API_BASE_URL, apiFetch } from './auth';
import { hydrateSocialAccounts } from './social';

export type SocialPlatform = 'meta' | 'tiktok';

export const oauthPopupClosedMessage = (platform: SocialPlatform): string =>
  platform === 'meta'
    ? 'Meta authentication closed before the connection finished. Please try again.'
    : 'TikTok authentication was cancelled before the connection finished.';

/**
 * Make an authenticated API request before navigating the popup to the OAuth
 * endpoint. Besides preventing a raw 401 JSON response from being rendered in
 * the popup, apiFetch gets an opportunity to refresh an expired access cookie.
 */
export const validateSocialOAuthSession = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const response = await apiFetch('/users/onboarding/status');
    if (response.ok) return { success: true };

    if (response.status === 401) {
      return {
        success: false,
        error: 'Your Growdex session has expired. Please sign in again before connecting an account.',
      };
    }

    return {
      success: false,
      error: await readResponseError(
        response,
        `Could not start the account connection (${response.status}).`,
      ),
    };
  } catch {
    return {
      success: false,
      error: 'Could not verify your Growdex session. Please refresh the page and try again.',
    };
  }
};

const openSizedOAuthWindow = (url: string, platform: SocialPlatform): Window | null => {
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  return window.open(
    url,
    `${platform}_oauth`,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`,
  );
};

/**
 * Open the OAuth popup and resolve with the authorization code returned by the
 * provider. The backend starts the provider flow; the frontend callback relays
 * the returned code so the backend can finish and save the connection.
 */
export const openOAuthPopup = (
  platform: SocialPlatform,
  onSuccess: (code?: string) => void,
  onError: (error: string) => void,
  existingPopup?: Window,
): Window | null => {
  if (!API_BASE_URL) {
    existingPopup?.close();
    onError("Social account connections are not configured. Please contact support.");
    return null;
  }

  // Backend builds the provider OAuth URL (scopes + state) and redirects.
  const popup = existingPopup ?? openSizedOAuthWindow(`${API_BASE_URL}/auth/${platform}`, platform);

  if (!popup) {
    onError('Popup blocked. Please allow popups.');
    return null;
  }

  if (existingPopup) popup.location.href = `${API_BASE_URL}/auth/${platform}`;

  // Track completion to avoid race condition between manual close and message receipt
  let isCompleted = false;
  const allowedOrigins = new Set([window.location.origin, new URL(API_BASE_URL).origin]);

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
        onError(oauthPopupClosedMessage(platform));
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
      const message = readApiErrorMessage(
        body,
        `Could not connect ${platform === 'meta' ? 'Meta' : 'TikTok'} (${response.status}).`,
      );
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
  // Open synchronously while this call still has the user's click activation;
  // navigating a new popup after the async preflight would be blocked by browsers.
  const popup = openSizedOAuthWindow('about:blank', platform);
  if (!popup) return { success: false, error: 'Popup blocked. Please allow popups.' };

  const session = await validateSocialOAuthSession();
  if (!session.success) {
    popup.close();
    return session;
  }

  const popupResult = await new Promise<{
    completed?: boolean;
    code?: string;
    error?: string;
  }>((resolve) => {
    openOAuthPopup(
      platform,
      (code) => resolve({ completed: true, code }),
      (error) => resolve({ error }),
      popup,
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
      throw new Error(
        await readResponseError(
          res,
          `Could not disconnect ${platform === "meta" ? "Meta" : "TikTok"} (${res.status}).`,
        ),
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
