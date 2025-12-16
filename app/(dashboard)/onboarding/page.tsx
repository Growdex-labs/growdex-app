'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { connectSocialAccount, disconnectSocialAccount, type SocialPlatform } from '@/lib/oauth';
import { savePersonalInfo, skipOnboarding } from '@/lib/onboarding';
import { StepOneOnboarding } from './components/step-one';
import { StepTwoOnboarding } from './components/step-two';
import { StepThreeOnboarding } from './components/step-three';
import { StepSideOnboarding } from './components/step-side';

export interface FormDataProps {
  firstName: string,
  lastName: string,
  organizationName: string,
  organizationSize: number,
}

export interface SocialAccountSetupProps {
  facebook: { connected: boolean; username: string; id?: string };
  instagram: { connected: boolean; username: string; error: boolean; id?: string };
  tiktok: { connected: boolean; username: string; id?: string };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
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
    facebook: { connected: false, username: '' },
    instagram: { connected: false, username: '', error: false },
    tiktok: { connected: false, username: '' },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNextStep = async () => {
    setError('');

    // Save Step 1 data before proceeding
    // if (currentStep === 1) {
    //   if (!formData.firstName || !formData.lastName) {
    //     setError('Please fill in your first and last name');
    //     return;
    //   }

    //   setIsLoading(true);
    //   const result = await savePersonalInfo(formData);
    //   setIsLoading(false);

    //   if (!result.success) {
    //     setError(result.error || 'Failed to save information');
    //     return;
    //   }
    // }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleConnectSocial = async (platform: SocialPlatform) => {
    setIsLoading(true);
    setError('');

    // Clear any previous error for Instagram
    if (platform === 'instagram') {
      setSocialAccounts(prev => ({
        ...prev,
        instagram: { ...prev.instagram, error: false }
      }));
    }

    const result = await connectSocialAccount(platform);

    setIsLoading(false);

    if (result.success && result.data) {
      setSocialAccounts(prev => ({
        ...prev,
        [platform]: {
          connected: true,
          username: result.data.username || result.data.name || 'Connected',
          id: result.data.id,
          error: false,
        },
      }));
    } else {
      // Show error for Instagram specifically
      if (platform === 'instagram') {
        setSocialAccounts(prev => ({
          ...prev,
          instagram: { ...prev.instagram, error: true }
        }));
      }
      setError(result.error || `Failed to connect ${platform}`);
    }
  };

  const handleDisconnectSocial = async (platform: SocialPlatform) => {
    setIsLoading(true);
    const result = await disconnectSocialAccount(platform);
    setIsLoading(false);

    if (result.success) {
      setSocialAccounts(prev => ({
        ...prev,
        [platform]: {
          connected: false,
          username: '',
          error: false,
        },
      }));
    } else {
      setError(result.error || `Failed to disconnect ${platform}`);
    }
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
              socialAccounts={socialAccounts}
              isLoading={isLoading}
              handleConnectSocial={handleConnectSocial}
              handleDisconnectSocial={handleDisconnectSocial}
              onNext={handleNextStep}
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
