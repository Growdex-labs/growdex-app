import { useState } from 'react';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGoogleAuth = () => {
    setLoading(true);
    setError(null);

    try {
      // Full-page redirect to your backend OAuth endpoint
      window.location.href = process.env.NEXT_PUBLIC_BACKEND_API_URL + '/auth/google';
    } catch (err) {
      console.error('Google authentication error:', err);
      setError('Google authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return { startGoogleAuth, loading, error };
};
