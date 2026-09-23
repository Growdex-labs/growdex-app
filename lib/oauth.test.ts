import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiFetch } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock('./auth', () => ({
  API_BASE_URL: 'https://api.growdex.test',
  apiFetch,
}));

import { buildOAuthCallbackPayload, readOAuthCallbackPayload } from './oauth-callback';
import { exchangeSocialAuthorizationCode, oauthPopupClosedMessage } from './oauth';

describe('oauthPopupClosedMessage', () => {
  it('identifies the Meta feature-unavailable page as a Growdex issue', () => {
    expect(oauthPopupClosedMessage('meta')).toContain(
      'this is a Growdex integration issue—not a problem with your Meta account',
    );
  });

  it('keeps the cancellation message platform-specific', () => {
    expect(oauthPopupClosedMessage('tiktok')).toBe(
      'TikTok authentication was cancelled before the connection finished.',
    );
  });
});

describe('buildOAuthCallbackPayload', () => {
  it('relays a provider authorization code', () => {
    expect(buildOAuthCallbackPayload('meta', 'provider-code', null)).toEqual({
      type: 'oauth_success',
      platform: 'meta',
      code: 'provider-code',
    });
  });

  it('relays a provider error instead of reporting success', () => {
    expect(buildOAuthCallbackPayload('meta', null, 'Access denied')).toEqual({
      type: 'oauth_error',
      platform: 'meta',
      error: 'Access denied',
    });
  });

  it('accepts a callback without a code when the backend saved the connection', () => {
    expect(buildOAuthCallbackPayload('meta', null, null)).toEqual({
      type: 'oauth_success',
      platform: 'meta',
    });
  });

  it('does not treat an explicit unsuccessful callback as connected', () => {
    expect(buildOAuthCallbackPayload('meta', null, null, false)).toEqual({
      type: 'oauth_error',
      platform: 'meta',
      error: 'The connection was not completed. Please try again.',
    });
  });
});

describe('readOAuthCallbackPayload', () => {
  it('accepts the legacy auth_code returned by Meta callbacks', () => {
    const params = new URLSearchParams('auth_code=legacy-meta-code');

    expect(readOAuthCallbackPayload('meta', params)).toEqual({
      type: 'oauth_success',
      platform: 'meta',
      code: 'legacy-meta-code',
    });
  });

  it('surfaces Meta error descriptions before generic error codes', () => {
    const params = new URLSearchParams(
      'error=access_denied&error_description=The+user+cancelled+the+login',
    );

    expect(readOAuthCallbackPayload('meta', params)).toEqual({
      type: 'oauth_error',
      platform: 'meta',
      error: 'The user cancelled the login',
    });
  });

  it('rejects legacy callbacks that explicitly report failure', () => {
    const params = new URLSearchParams('success=false');

    expect(readOAuthCallbackPayload('meta', params).type).toBe('oauth_error');
  });
});

describe('exchangeSocialAuthorizationCode', () => {
  beforeEach(() => {
    apiFetch.mockReset();
  });

  it('sends the provider code and returns the saved connection', async () => {
    const data = { meta: { connected: true, assets: [] } };
    apiFetch.mockResolvedValue(
      new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(
      exchangeSocialAuthorizationCode('meta', 'provider-code'),
    ).resolves.toEqual({ success: true, data });
    expect(apiFetch).toHaveBeenCalledWith('/users/onboarding/connect/meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'provider-code' }),
    });
  });

  it('shows the backend failure when the exchange is rejected', async () => {
    apiFetch.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Meta code exchange failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(
      exchangeSocialAuthorizationCode('meta', 'invalid-code'),
    ).resolves.toEqual({
      success: false,
      error: 'Meta code exchange failed',
    });
  });

  it('does not report success until the backend returns a saved account', async () => {
    apiFetch.mockResolvedValue(
      new Response(JSON.stringify({ meta: { connected: false } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await exchangeSocialAuthorizationCode('meta', 'provider-code');

    expect(result.success).toBe(false);
    expect(result.error).toContain('connected account was not saved');
  });
});
