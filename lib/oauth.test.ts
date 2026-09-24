import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { apiFetch } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock('./auth', () => ({
  API_BASE_URL: 'https://api.growdex.test',
  apiFetch,
}));

import { buildOAuthCallbackPayload } from './oauth-callback';
import {
  exchangeSocialAuthorizationCode,
  oauthPopupClosedMessage,
  oauthSessionExpiredMessage,
  openOAuthPopup,
} from './oauth';

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

describe('openOAuthPopup', () => {
  const popup = { closed: false, close: vi.fn(), location: { href: 'about:blank' } };
  const open = vi.fn(() => popup);

  beforeEach(() => {
    apiFetch.mockReset();
    popup.closed = false;
    popup.close.mockReset();
    popup.location.href = 'about:blank';
    open.mockClear();
    vi.stubGlobal('window', {
      open,
      screenX: 0,
      screenY: 0,
      outerWidth: 1200,
      outerHeight: 900,
      location: { origin: 'https://growdex.test' },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('refreshes the session before loading the provider flow', async () => {
    apiFetch.mockResolvedValue(new Response(null, { status: 200 }));

    openOAuthPopup('meta', vi.fn(), vi.fn());

    expect(open).toHaveBeenCalledWith('about:blank', 'meta_oauth', expect.any(String));
    expect(apiFetch).toHaveBeenCalledWith('/auth/refresh', { method: 'POST' });
    await vi.waitFor(() =>
      expect(popup.location.href).toBe('https://api.growdex.test/auth/meta'),
    );
  });

  it('asks the user to sign in again when the session cannot be refreshed', async () => {
    apiFetch.mockResolvedValue(new Response(null, { status: 401 }));
    const onError = vi.fn();

    openOAuthPopup('meta', vi.fn(), onError);

    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(oauthSessionExpiredMessage));
    expect(popup.close).toHaveBeenCalled();
    expect(popup.location.href).toBe('about:blank');
  });
});
