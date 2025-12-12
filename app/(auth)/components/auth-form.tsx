'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, register } from '@/lib/auth';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { GoogleBtn } from './google-btn';

export default function AuthForm({ title, isAuthType }: { title: string; isAuthType: 'login' | 'register' }) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      try {
        // TODO: Replace with your actual backend API endpoint
        const response = isAuthType === 'login'
        ? await login(email, password)
        : await register(email, password);

        // Redirect to panel (dashboard)
        router.push('/panel');
      } catch (err) {
        console.error(isAuthType === 'login' ? 'Login error:' : 'Register error:', err);
        setError(isAuthType === 'login' ? 'Login failed. Please check your credentials.' : 'Register failed. Please check your credentials.');
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
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your details
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

            <div>
              <label htmlFor="Password" className="relative">
                <input
                  type="password"
                  id="Password"
                  placeholder=""
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer mt-0.5 w-full border-gray-300 shadow-sm sm:text-sm px-4 py-3 border placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki-300 focus:border-transparent"
                />

                <span className="absolute inset-y-0 start-3 -translate-y-5 bg-white px-0.5 text-sm font-medium text-gray-700 transition-transform peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-5 flex items-center gap-2">
                  <Lock className="w-5 h-5 flex-shrink-0 text-gray-500" /> Your password
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
              {isLoading ? 'Signing in...' : isAuthType === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            Or
            <GoogleBtn isAuthType={isAuthType} setError={setError} />
            <div className="mt-2 flex items-center justify-center gap-2 font-medium">
                {isAuthType === 'login'
                ?
                <>
                New here?
                <Link href="/signup" className='font-bold hover:underline'>Create an account</Link>
                </>
                :
                <>
                Got an account?
                <Link href="/login" className='font-bold hover:underline'>Sign in</Link>
                </>
                }
            </div>
            {isAuthType === 'login' ? <Link href="/forgot-password" className='mt-8 hover:underline'>Forgot password?</Link> : ''}
          </div>
        </form>
      </div>
    </div>
    );
}
