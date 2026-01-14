'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function MetaOAuthPopup() {
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      window.opener?.postMessage(
        { type: 'oauth_error', platform: 'meta', error },
        window.location.origin
      );
      window.close();
      return;
    }

    if (code) {
      window.opener?.postMessage(
        { type: 'oauth_success', platform: 'meta', code },
        window.location.origin
      );
      window.close();
    }
  }, [params]);

  return <p className="p-4 text-sm">Connecting Meta…</p>;
}
