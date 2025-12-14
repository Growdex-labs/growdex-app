'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isOnboardingComplete, markOnboardingComplete } from '@/lib/onboarding';
import { getCurrentUser } from '@/lib/auth';

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
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check onboarding status from local storage first for quick check
      if (!isOnboardingComplete()) {
        if (!user.onboardingCompleted) {
          router.push('/onboarding');
          return;
        } else {
          markOnboardingComplete();
        }
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
