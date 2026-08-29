'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthRequestError, getCurrentUser } from '@/lib/auth';
import { track } from '@/lib/analytics';

export default function PanelRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const checkAccess = async () => {
      try {
        const user = await getCurrentUser();
        if (!active) return;
        if (!user) {
          router.replace('/login');
          return;
        }
        if (!user.onboardingCompleted) {
          router.replace('/onboarding');
          return;
        }
        setIsLoading(false);
      } catch (error) {
        if (!active) return;
        if (
          error instanceof AuthRequestError &&
          (error.status === 401 || error.status === 403)
        ) {
          router.replace('/login');
          return;
        }
        setAccessError(
          "We could not verify your account right now. Please refresh and try again.",
        );
        setIsLoading(false);
      }
    };

    void checkAccess();
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (isLoading || accessError) return;
    track('page_view', { pathname });
  }, [accessError, isLoading, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div role="alert" className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-gilroy-semibold text-gray-900">Account check failed</h1>
          <p className="mt-2 text-sm text-gray-600">{accessError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-gilroy-medium text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
