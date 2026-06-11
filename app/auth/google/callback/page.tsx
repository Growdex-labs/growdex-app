'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const DIRECT_API = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ?? process.env.NEXT_PUBLIC_BACKEND_API_URL ?? '';

async function fetchUserDirect() {
  const res = await fetch(`${DIRECT_API}/users/me`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing sign in…');

  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get('error');
      if (error) {
        setStatus('error');
        setMessage('Google sign in was cancelled or failed. Please try again.');
        return;
      }

      try {
        const user = await fetchUserDirect();

        if (!user) {
          setStatus('error');
          setMessage('Session could not be verified. Please sign in again.');
          return;
        }

        sessionStorage.setItem('growdex_user', JSON.stringify(user));
        setStatus('success');
        setMessage('Signed in successfully! Redirecting…');
        setTimeout(() => {
          router.push(user.onboardingCompleted ? '/panel' : '/onboarding');
        }, 1500);
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-md w-full">
      {status === 'loading' && (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">{message}</h3>
          <p className="mt-2 text-sm text-gray-500">Please wait while we complete your sign in.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">{message}</h3>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-900">{message}</h3>
          <div className="mt-6">
            <button
              onClick={() => router.push('/login')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none"
            >
              Back to Login
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />}>
        <GoogleCallbackContent />
      </Suspense>
    </div>
  );
}
