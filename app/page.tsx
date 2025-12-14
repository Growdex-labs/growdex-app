'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { markOnboardingComplete } from '@/lib/onboarding';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndRedirect = async () => {
      // Check authentication first
      console.log('Checking authentication...');
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check onboarding status
      setIsChecking(false);

      console.log('Checking onboarding status...');
      console.log('User:', user);
      if (user.onboardingCompleted) {
        console.log('User has completed onboarding, going to dashboard...');
        // User has completed onboarding, go to dashboard
        markOnboardingComplete();
        router.push('/panel');
      } else {
        console.log('User needs to complete onboarding, going to onboarding...');
        // User needs to complete onboarding
        router.push('/onboarding');
      }
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
