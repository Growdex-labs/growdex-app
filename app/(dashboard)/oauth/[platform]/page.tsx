'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

type OAuthMessage =
  | { type: 'oauth_success'; platform: string; code: string }
  | { type: 'oauth_error'; platform: string; error: string };

function OAuthCallbackContent() {
  const params = useParams<{ platform: string }>();
  const searchParams = useSearchParams();
  const platform = params.platform;
  const code = searchParams.get('code') || searchParams.get('auth_code');
  const error = searchParams.get('error') || searchParams.get('error_description');

  const payload: OAuthMessage = useMemo(
    () =>
      error
        ? { type: 'oauth_error', platform, error }
        : code
          ? { type: 'oauth_success', platform, code }
          : { type: 'oauth_error', platform, error: 'Missing authorization code' },
    [code, error, platform]
  );

  const message =
    payload.type === 'oauth_error'
      ? `Connection failed: ${payload.error}`
      : 'Connection complete. You can return to Growdex.';

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(payload, window.location.origin);
      window.close();
    }
  }, [payload]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-gray-900" />
        <p className="text-sm text-[#666]">{message}</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-gray-900" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
