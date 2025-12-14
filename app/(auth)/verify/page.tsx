'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying account...');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const response = await apiFetch('/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Verification failed');
        }

        setStatus('success');
        setMessage('Account verified successfully!');

        // Redirect after a short delay so user sees the success message
        setTimeout(() => {
          router.push('/panel');
        }, 2000);
      } catch (error: any) {
        console.error('Error verifying email:', error);
        setStatus('error');
        setMessage(error.message || 'Verification link has expired or is invalid.');
      }
    };

    verifyToken();
  }, [router, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-md w-full">
        {status === 'verifying' && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        )}

        {status === 'success' && (
           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
             <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
               <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
             </svg>
           </div>
        )}

        {status === 'error' && (
           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
             <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
             </svg>
           </div>
        )}

        <h3 className={`text-lg font-medium ${status === 'error' ? 'text-red-900' : 'text-gray-900'}`}>
          {message}
        </h3>

        {status === 'error' && (
           <div className="mt-6">
             <button
               onClick={() => router.push('/login')}
               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
             >
               Back to Login
             </button>
           </div>
        )}
      </div>
    </div>
  );
}
