'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, setupTokenRefresh } from '@/lib/auth';
import { fetchOnboardingStatus } from '@/lib/onboarding';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndRedirect = async () => {
      // Set up automatic token refresh
      const cleanup = setupTokenRefresh();

      // Check authentication first
      if (!isAuthenticated()) {
        router.push('/login');
        return cleanup;
      }

      // Check onboarding status
      const result = await fetchOnboardingStatus();
      setIsChecking(false);

      if (result.success) {
        if (result.completed) {
          // User has completed onboarding, go to dashboard
          router.push('/panel');
        } else {
          // User needs to complete onboarding
          router.push('/onboarding');
        }
      } else {
        // If we can't fetch onboarding status, assume incomplete
        router.push('/onboarding');
      }

      return cleanup;
    };

    checkAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <div className="text-gray-600">
          {isChecking ? 'Loading...' : 'Redirecting...'}
        </div>
      </div>
    </div>
  );
}
