// Token management utilities for secure client-side authentication

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

const TOKEN_STORAGE_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Securely store authentication tokens
 * Note: For production, consider using httpOnly cookies via your backend
 */
export const setAuthToken = (accessToken: string, expiresIn: number, refreshToken?: string): void => {
  const expiresAt = Date.now() + expiresIn * 1000;

  const tokenData: TokenData = {
    accessToken,
    refreshToken,
    expiresAt,
  };

  // Store in sessionStorage for better security (cleared on tab close)
  // Or use localStorage if you want persistent sessions
  sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));

  if (refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

/**
 * Retrieve the access token if valid
 */
export const getAuthToken = (): string | null => {
  try {
    const tokenDataStr = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!tokenDataStr) return null;

    const tokenData: TokenData = JSON.parse(tokenDataStr);

    // Check if token is expired
    if (Date.now() >= tokenData.expiresAt) {
      clearAuthTokens();
      return null;
    }

    return tokenData.accessToken;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Get refresh token
 */
export const getRefreshToken = (): string | null => {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

/**
 * Clear all authentication tokens
 */
export const clearAuthTokens = (): void => {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  // Also clear any legacy localStorage items
  localStorage.removeItem('isAuthenticated');
};

/**
 * Get token expiration time in milliseconds
 */
export const getTokenExpiration = (): number | null => {
  try {
    const tokenDataStr = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!tokenDataStr) return null;

    const tokenData: TokenData = JSON.parse(tokenDataStr);
    return tokenData.expiresAt;
  } catch (error) {
    return null;
  }
};

/**
 * Check if token will expire soon (within 5 minutes)
 */
export const shouldRefreshToken = (): boolean => {
  const expiresAt = getTokenExpiration();
  if (!expiresAt) return false;

  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() >= expiresAt - fiveMinutes;
};

/**
 * Create authorization header for API requests
 */
export const getAuthHeader = (): HeadersInit => {
  const token = getAuthToken();
  if (!token) return {};

  return {
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Refresh the access token using refresh token
 * This should call your backend API endpoint
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    // TODO: Replace with your actual API endpoint
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearAuthTokens();
      return false;
    }

    const data = await response.json();
    setAuthToken(data.accessToken, data.expiresIn, data.refreshToken);
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearAuthTokens();
    return false;
  }
};

/**
 * Auto-refresh token when it's about to expire
 * Call this on app initialization or in a useEffect
 */
export const setupTokenRefresh = (): (() => void) => {
  const checkAndRefresh = async () => {
    if (shouldRefreshToken()) {
      await refreshAccessToken();
    }
  };

  // Check every minute
  const interval = setInterval(checkAndRefresh, 60 * 1000);

  // Initial check
  checkAndRefresh();

  // Return cleanup function
  return () => clearInterval(interval);
};
