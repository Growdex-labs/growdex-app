'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default function PanelRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

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
      } catch {
        if (active) router.replace('/login');
      }
    };

    void checkAccess();
    return () => {
      active = false;
    };
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
