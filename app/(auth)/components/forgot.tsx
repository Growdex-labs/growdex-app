'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/lib/auth';

export default function ForgotForm() {
    const router = useRouter();
      const [email, setEmail] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState('');



      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
          // TODO: Replace with your actual backend API endpoint
          const endpoint = '/api/auth/forgot';
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });

          if (!response.ok) {
            throw new Error('Forgot password failed');
          }

          const data = await response.json();

          // Redirect to panel (dashboard)
          router.push('/panel');
        } catch (err) {
          console.error('Forgot password error:', err);
          setError('Forgot password failed. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      const handleGoogleAuth = async () => {
        try {
          // TODO: Replace with your actual backend API endpoint
          const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Google authentication failed');
          }

          const data = await response.json();

          // Securely store the authentication token
          setAuthToken(data.accessToken, data.expiresIn, data.refreshToken);

          // Redirect to panel (dashboard)
          router.push('/panel');
        } catch (err) {
          console.error('Google authentication error:', err);
          setError('Google authentication failed. Please try again.');
        }
      };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="logo" />
            </div>
            <span className="font-bold text-2xl text-gray-900">Growdex</span>
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="Email" className="relative">
                <input
                  type="email"
                  id="Email"
                  placeholder="johndoe@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer mt-0.5 w-full border-gray-300 shadow-sm sm:text-sm px-4 py-3 border placeholder-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki-300 focus:border-transparent placeholder:opacity-0 focus:placeholder:opacity-100"
                />

                <span className="absolute inset-y-0 start-3 -translate-y-5 bg-white px-0.5 text-sm font-medium text-gray-700 transition-transform peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-5">
                  Your email
                </span>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-gray-900 bg-khaki-200 hover:bg-khaki-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            Or
            <a href="#" className="mt-2 flex items-center justify-center gap-2 font-medium p-2 border border-black rounded-lg hover:bg-gray-100 transition-colors" onClick={handleGoogleAuth}>
              <img src="/devicon_google.png" alt="google" /> Sign in with Google
            </a>
          </div>
        </form>
      </div>
    </div>
    );
}
