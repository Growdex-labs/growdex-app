'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function TiktokOAuthPopupContent() {
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      window.opener?.postMessage(
        { type: 'oauth_error', platform: 'tiktok', error },
        window.location.origin
      );
      window.close();
      return;
    }

    if (code) {
      window.opener?.postMessage(
        { type: 'oauth_success', platform: 'tiktok', code },
        window.location.origin
      );
      window.close();
    }
  }, [params]);

  return <p className="p-4 text-sm">Connecting Tiktok…</p>;
}

export default function TiktokOAuthPopup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>}>
        <TiktokOAuthPopupContent />
      </Suspense>
    </div>
  );
}
