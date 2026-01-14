'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { connectSocialAccount, disconnectSocialAccount, type SocialPlatform } from '@/lib/oauth';
import { fetchOnboardingStatus, savePersonalInfo, skipOnboarding } from '@/lib/onboarding';
import { StepOneOnboarding } from './components/step-one';
import { StepTwoOnboarding } from './components/step-two';
import { StepThreeOnboarding } from './components/step-three';
import { StepSideOnboarding } from './components/step-side';
import { SocialAccountSetupProps } from '@/types/social';

export interface FormDataProps {
  firstName: string,
  lastName: string,
  organizationName: string,
  organizationSize: number,
}

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');
  const currentStep = stepParam ? Number(stepParam) : 1;

  const modeParam = searchParams.get('mode');
  const step2Mode = modeParam === 'confirm' ? 'confirm' : 'connect';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data state
  const [formData, setFormData] = useState<FormDataProps>({
    firstName: '',
    lastName: '',
    organizationName: '',
    organizationSize: 0,
  });

  // Social accounts state
  const [socialAccounts, setSocialAccounts] = useState<SocialAccountSetupProps>({
    meta: { connected: false, needsReauth: false },
    tiktok: { connected: false, needsReauth: false },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const goToStep = (step: number, extra?: Record<string, string>) => {
    const params = new URLSearchParams({
      step: step.toString(),
      ...extra,
    });

    router.push(`/onboarding?${params.toString()}`);
  };

  const handleNextStep = async () => {
    setError('');

    // Save Step 1 data before proceeding
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName) {
        setError('Please fill in your first and last name');
        return;
      }

      if (!formData.organizationName || formData.organizationSize === 0) {
        setError('Please fill in your organization name and size');
        return;
      }

      setIsLoading(true);
      const result = await savePersonalInfo(formData);
      setIsLoading(false);

      if (!result.success) {
        setError(result.error || 'Failed to save information');
        return;
      }
      goToStep(2);
      return;
    }

    if (currentStep < 3) {
      goToStep(currentStep + 1);
    }
  };

  const handleConnectSocial = async (platform: SocialPlatform) => {
    setIsLoading(true);
    setError('');

    const result = await connectSocialAccount(platform);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || `Failed to connect ${platform}`);
      return;
    }

    goToStep(2, {
      platform,
      status: 'connected',
    });
  };

  const handleDisconnectSocial = async (platform: SocialPlatform) => {
    setIsLoading(true);
    const result = await disconnectSocialAccount(platform);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || `Failed to disconnect ${platform}`);
      return;
    }

    goToStep(2, {
      platform,
      status: 'disconnected',
    });
  };

  const handleSetupLater = async () => {
    setIsLoading(true);
    const result = await skipOnboarding();
    setIsLoading(false);

    if (result.success) {
      router.push('/panel');
    } else {
      setError(result.error || 'Failed to skip onboarding');
    }
  };

  const handleGoToDashboard = async () => {
    setIsLoading(true);

    router.push('/panel');
  };

  useEffect(() => {
    if (currentStep !== 2) return;

    const hydrate = async () => {
      const res = await fetchOnboardingStatus();

      setSocialAccounts(res.data?.socialAccounts || { meta: { connected: false, needsReauth: false, assets: [] }, tiktok: { connected: false, needsReauth: false, assets: [] } });
    };

    hydrate();
  }, [currentStep]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <StepSideOnboarding currentStep={currentStep} />

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-12">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="flex justify-end mb-12">
            <button className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Menu ☰
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm px-2 py-1 rounded-lg">
              {error}
            </div>
          )}

          {/* Step 1: Get Started */}
          {currentStep === 1 && (
            <StepOneOnboarding
              formData={formData}
              onNext={handleNextStep}
              inputChange={handleInputChange}
              isLoading={isLoading}
            />
          )}

          {/* Step 2: Setup Social Accounts */}
          {currentStep === 2 && (
            <StepTwoOnboarding
              mode={step2Mode}
              socialAccounts={socialAccounts}
              isLoading={isLoading}
              handleConnectSocial={handleConnectSocial}
              handleDisconnectSocial={handleDisconnectSocial}
              onNext={() => goToStep(2, { mode: 'confirm' })}
              onConfirm={() => goToStep(3)}
              handleSetupLater={handleSetupLater}
            />
          )}

          {/* Step 3: Launch Growdex */}
          {currentStep === 3 && (
            <StepThreeOnboarding
              isLoading={isLoading}
              handleGoToDashboard={handleGoToDashboard}
            />
          )}
        </div>
      </main>
    </div>
  );
}
