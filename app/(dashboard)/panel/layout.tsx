'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isOnboardingComplete } from '@/lib/onboarding';
import { apiFetch } from '@/lib/auth';

export default function PanelRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // First check authentication
      const isAuthenticated = await apiFetch('/users/me');
      if (!isAuthenticated.ok) {
        router.push('/login');
        return;
      }

      // Check onboarding status from local storage first for quick check
      if (!isOnboardingComplete()) {
        router.push('/onboarding');
        return;
      }

      setIsLoading(false);
    };

    checkAccess();
  }, [router]);

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

  return <>{children}</>;
}
