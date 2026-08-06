import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiFetch } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock('./auth', () => ({
  API_BASE_URL: 'https://api.growdex.test',
  apiFetch,
}));

import { buildOAuthCallbackPayload } from './oauth-callback';
import { exchangeSocialAuthorizationCode } from './oauth';

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

  it('rejects a callback that has neither a code nor an error', () => {
    expect(buildOAuthCallbackPayload('meta', null, null)).toEqual({
      type: 'oauth_error',
      platform: 'meta',
      error: 'The authorization provider did not return a connection code.',
    });
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
