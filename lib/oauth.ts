// OAuth utilities for social media platform integration

import { getAuthHeader } from './auth';

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok';

interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
}

// OAuth configuration for each platform
// TODO: Replace with your actual client IDs and redirect URIs
const OAUTH_CONFIGS: Record<SocialPlatform, OAuthConfig> = {
  facebook: {
    clientId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
    redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/oauth/facebook/callback`,
    scope: 'email,public_profile,pages_show_list,pages_read_engagement',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
  },
  instagram: {
    clientId: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || '',
    redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/oauth/instagram/callback`,
    scope: 'user_profile,user_media',
    authUrl: 'https://api.instagram.com/oauth/authorize',
  },
  tiktok: {
    clientId: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY || '',
    redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/oauth/tiktok/callback`,
    scope: 'user.info.basic,video.list',
    authUrl: 'https://www.tiktok.com/v2/auth/authorize',
  },
};

/**
 * Generate OAuth URL for a platform
 */
export const getOAuthUrl = (platform: SocialPlatform): string => {
  const config = OAUTH_CONFIGS[platform];

  if (!config.clientId) {
    console.error(`Missing client ID for ${platform}. Set NEXT_PUBLIC_${platform.toUpperCase()}_APP_ID in your .env.local`);
    return '';
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: 'code',
    state: generateState(platform), // CSRF protection
  });

  return `${config.authUrl}?${params.toString()}`;
};

/**
 * Generate a random state parameter for CSRF protection
 */
const generateState = (platform: SocialPlatform): string => {
  const state = `${platform}_${Math.random().toString(36).substring(2, 15)}`;
  // Store in sessionStorage for verification after redirect
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', state);
  }
  return state;
};

/**
 * Verify OAuth state parameter to prevent CSRF
 */
export const verifyOAuthState = (returnedState: string): boolean => {
  if (typeof window === 'undefined') return false;

  const savedState = sessionStorage.getItem('oauth_state');
  sessionStorage.removeItem('oauth_state');

  return savedState === returnedState;
};

/**
 * Open OAuth popup window
 */
export const openOAuthPopup = (
  platform: SocialPlatform,
  onSuccess: (data: any) => void,
  onError: (error: string) => void
): Window | null => {
  const oauthUrl = getOAuthUrl(platform);

  if (!oauthUrl) {
    onError('OAuth configuration missing');
    return null;
  }

  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    oauthUrl,
    `${platform}_oauth`,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
  );

  if (!popup) {
    onError('Popup blocked. Please allow popups for this site.');
    return null;
  }

  // Listen for OAuth callback
  const messageHandler = (event: MessageEvent) => {
    // Verify origin for security
    if (event.origin !== window.location.origin) return;

    if (event.data.type === 'oauth_success' && event.data.platform === platform) {
      window.removeEventListener('message', messageHandler);
      onSuccess(event.data.data);
      popup.close();
    } else if (event.data.type === 'oauth_error' && event.data.platform === platform) {
      window.removeEventListener('message', messageHandler);
      onError(event.data.error);
      popup.close();
    }
  };

  window.addEventListener('message', messageHandler);

  // Check if popup was closed by user
  const checkPopupClosed = setInterval(() => {
    if (popup.closed) {
      clearInterval(checkPopupClosed);
      window.removeEventListener('message', messageHandler);
    }
  }, 500);

  return popup;
};

/**
 * Connect a social account via OAuth
 */
export const connectSocialAccount = async (
  platform: SocialPlatform
): Promise<{ success: boolean; data?: any; error?: string }> => {
  return new Promise((resolve) => {
    openOAuthPopup(
      platform,
      async (oauthData) => {
        try {
          // Send OAuth data to backend to complete the connection
          const response = await fetch('/api/social/connect', {
            method: 'POST',
            headers: {
              ...getAuthHeader(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              platform,
              code: oauthData.code,
              state: oauthData.state,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to connect account');
          }

          const data = await response.json();
          resolve({ success: true, data });
        } catch (error) {
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to connect account',
          });
        }
      },
      (error) => {
        resolve({ success: false, error });
      }
    );
  });
};

/**
 * Disconnect a social account
 */
export const disconnectSocialAccount = async (
  platform: SocialPlatform
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`/api/social/disconnect`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platform }),
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect account');
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to disconnect account',
    };
  }
};

/**
 * Get connected social accounts
 */
export const getConnectedAccounts = async (): Promise<{
  success: boolean;
  accounts?: Record<SocialPlatform, any>;
  error?: string;
}> => {
  try {
    const response = await fetch('/api/social/accounts', {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch accounts');
    }

    const data = await response.json();
    return { success: true, accounts: data.accounts };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch accounts',
    };
  }
};
