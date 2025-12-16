'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import { apiFetch, resetPassword } from '@/lib/auth';
import { GoogleBtn } from './google-btn';
import { toast } from 'sonner';

export default function ResetForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!token) {
      toast.error('Invalid link');
      router.push('/login');
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      try {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        if (password.length < 8) {
          setError('Password must be at least 8 characters long');
          return;
        }

        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)) {
          setError('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character');
          return;
        }

        const response = await resetPassword(token!, password, confirmPassword);
        toast.success(response.message, {
          description: "Use new password to login",
          action: {
            label: "Login",
            onClick: () => router.push('/login'),
          },
          duration: 10000,
        });
        setTimeout(() => {
          router.push('/login');
        }, 11000);
      } catch (err: any) {
        console.error('Reset password error:', err);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
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
            Reset your password?
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="relative">
                <input
                  type="password"
                  id="password"
                  placeholder="New password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer mt-0.5 w-full border-gray-300 shadow-sm sm:text-sm px-4 py-3 border placeholder-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki-300 focus:border-transparent placeholder:opacity-0 focus:placeholder:opacity-100"
                />

                <span className="absolute inset-y-0 start-3 -translate-y-5 bg-white px-0.5 text-sm font-medium text-gray-700 transition-transform peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-5 flex items-center gap-2">
                  <Lock className="w-5 h-5 flex-shrink-0 text-gray-500" /> Password
                </span>
              </label>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="peer mt-0.5 w-full border-gray-300 shadow-sm sm:text-sm px-4 py-3 border placeholder-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki-300 focus:border-transparent placeholder:opacity-0 focus:placeholder:opacity-100"
                />

                <span className="absolute inset-y-0 start-3 -translate-y-5 bg-white px-0.5 text-sm font-medium text-gray-700 transition-transform peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-5 flex items-center gap-2">
                  <Lock className="w-5 h-5 flex-shrink-0 text-gray-500" /> Confirm your Password
                </span>
              </label>
              {error && (
                <div className="mt-1 bg-red-50 border border-red-200 text-red-600 p-1 rounded-lg text-xs">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-gray-900 bg-khaki-200 hover:bg-khaki-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Go to Sign in'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            Or
            <GoogleBtn isAuthType={'login'} setError={setError} />
          </div>
        </form>
      </div>
    </div>
    );
}
