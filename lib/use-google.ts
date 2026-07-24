import { useState } from 'react';
import { clearDevSession } from './auth';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const enabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED !== 'false';

  const startGoogleAuth = () => {
    setError(null);

    if (!enabled) {
      setError(
        'Google sign-in is not configured for this environment. Use your email and password.',
      );
      return;
    }

    setLoading(true);

    try {
      clearDevSession();
      // Full-page redirect to your backend OAuth endpoint
      const oauthBase = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ?? process.env.NEXT_PUBLIC_BACKEND_API_URL;
      if (!oauthBase) {
        throw new Error('Google authentication URL is not configured');
      }
      window.location.href = oauthBase + '/auth/google';
    } catch (err) {
      console.error('Google authentication error:', err);
      setError('Google authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return { startGoogleAuth, loading, error, enabled };
};
