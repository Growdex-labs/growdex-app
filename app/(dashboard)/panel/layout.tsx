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
      console.log('Checking authentication...');
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check onboarding status from local storage first for quick check
      console.log('Checking onboarding status...');
      console.log('User:', user);
      // saving user to session storage
      sessionStorage.setItem('growdex_user', JSON.stringify(user));
      if (!isOnboardingComplete()) {
        if (!user.onboardingCompleted) {
          console.log('User needs to complete onboarding, going to onboarding...');
          console.log('Checking what step to navigate to...');
          if (user.profile.firstName && user.profile.lastName && user.brand.name) {
            console.log('User has completed step 1, going to step 2...');
            router.push('/onboarding?step=2');
            return;
          }
          router.push('/onboarding');
          return;
        } else {
          console.log('User has completed onboarding, going to dashboard...');
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
