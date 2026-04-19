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
      try {
        const user = await getCurrentUser();

        if (!user) {
          setIsChecking(false);
          router.push('/login');
          return;
        }

        if (!user.onboardingCompleted) {
          setIsChecking(false);
          router.push('/onboarding');
          return;
        }

        setIsChecking(false);
        router.push('/panel');
      } catch (error) {
        setIsChecking(false);
        router.push('/login');
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