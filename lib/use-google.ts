import { useState } from 'react';
import { clearDevSession } from './auth';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGoogleAuth = () => {
    setLoading(true);
    setError(null);

    try {
      clearDevSession();
      // Full-page redirect to your backend OAuth endpoint
      const oauthBase = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ?? process.env.NEXT_PUBLIC_BACKEND_API_URL;
      window.location.href = oauthBase + '/auth/google';
    } catch (err) {
      console.error('Google authentication error:', err);
      setError('Google authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return { startGoogleAuth, loading, error };
};
