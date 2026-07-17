'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { connectSocialAccount, type SocialPlatform } from '@/lib/oauth';
import {
  fetchOnboardingStatus,
  savePersonalInfo,
  saveBusinessInfo,
  saveMarketingGoals,
  completeOnboarding,
} from '@/lib/onboarding';
import { hydrateSocialAccounts } from '@/lib/social';
import { SocialAccountSetupProps } from '@/types/social';
import { OnboardingLayout } from './components/onboarding-layout';
import { StepOneOnboarding } from './components/step-one';
import { StepTwoOnboarding } from './components/step-two';
import { StepThreeOnboarding } from './components/step-three';
import { StepConnectOnboarding } from './components/step-connect';

export interface FormDataProps {
  firstName: string;
  lastName: string;
  organizationName: string;
  organizationSize: number;
  // Step 1 — profile
  industry: string;
  monthlyBudget: string;
  // Step 2 — business
  businessName: string;
  website: string;
  advertisingBudget: string;
  country: string;
  // Step 3 — goals
  goals: string[];
  customGoal: string;
}

const TOTAL_STEPS = 4;

function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');
  const currentStep = stepParam ? Number(stepParam) : 1;

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormDataProps>({
    firstName: '',
    lastName: '',
    organizationName: '',
    organizationSize: 0,
    industry: '',
    monthlyBudget: '',
    businessName: '',
    website: '',
    advertisingBudget: '',
    country: '',
    goals: [],
    customGoal: '',
  });

  const [socialAccounts, setSocialAccounts] = useState<SocialAccountSetupProps>({
    meta: { connected: false, needsReauth: false },
    tiktok: { connected: false, needsReauth: false },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const goToStep = (step: number) => {
    router.push(`/onboarding?step=${step}`);
  };

  const handleProfileNext = async () => {
    setError('');

    if (!formData.firstName || !formData.lastName) {
      setError('Please fill in your first and last name');
      return;
    }
    if (!formData.organizationName) {
      setError('Please fill in your organization name');
      return;
    }

    setLoadingAction('step1-submit');
    const result = await savePersonalInfo({
      firstName: formData.firstName,
      lastName: formData.lastName,
      organizationName: formData.organizationName,
      organizationSize: formData.organizationSize,
      industry: formData.industry,
      monthlyBudget: formData.monthlyBudget,
    });
    setLoadingAction(null);

    if (!result.success) {
      setError(result.error || 'Failed to save information');
      return;
    }

    goToStep(2);
  };

  const handleBusinessNext = async () => {
    setError('');

    setLoadingAction('step2-submit');
    const result = await saveBusinessInfo({
      businessName: formData.businessName,
      website: formData.website,
      advertisingBudget: formData.advertisingBudget,
      industry: formData.industry,
      country: formData.country,
    });
    setLoadingAction(null);

    if (!result.success) {
      setError(result.error || 'Failed to save business information');
      return;
    }

    goToStep(3);
  };

  const handleGoalsNext = async () => {
    setError('');

    setLoadingAction('step3-submit');
    const result = await saveMarketingGoals({
      goals: formData.goals,
      customGoal: formData.customGoal,
    });
    setLoadingAction(null);

    if (!result.success) {
      setError(result.error || 'Failed to save marketing goals');
      return;
    }

    goToStep(4);
  };

  const handleConnectSocial = async (platform: SocialPlatform) => {
    setLoadingAction(platform);
    setError('');

    const result = await connectSocialAccount(platform);
    setLoadingAction(null);

    if (!result.success) {
      setError(result.error || `Failed to connect ${platform}`);
      return;
    }

    if (result.data) {
      setSocialAccounts(result.data);
    } else {
      await refreshSocialAccounts();
    }
  };

  const handleSetupLater = async () => {
    setLoadingAction('setup-later');
    const result = await completeOnboarding();
    setLoadingAction(null);

    if (result.success) {
      router.push('/panel');
    } else {
      setError(result.error || 'Failed to skip onboarding');
    }
  };

  const handleComplete = async () => {
    setLoadingAction('complete');
    const result = await completeOnboarding();
    setLoadingAction(null);

    if (result.success) {
      router.push('/panel');
    } else {
      setError(result.error || 'Failed to complete onboarding');
    }
  };

  const refreshSocialAccounts = async () => {
    const res = await hydrateSocialAccounts();
    if (res.success && res.data) {
      setSocialAccounts(res.data);
    }
  };

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    const hydrate = async () => {
      const res = await fetchOnboardingStatus();
      if (res.success && res.data) {
        const { personalInfo, business, goals } = res.data;
        const [first, ...rest] = personalInfo.name.split(' ');
        setFormData((prev) => ({
          ...prev,
          firstName: first || '',
          lastName: rest.join(' ') || '',
          organizationName: personalInfo.organizationName || '',
          organizationSize: Number(personalInfo.organizationSize) || 0,
          industry: personalInfo.industry || business?.industry || '',
          monthlyBudget: personalInfo.monthlyBudget || '',
          businessName: business?.businessName || '',
          website: business?.website || '',
          advertisingBudget: business?.advertisingBudget || '',
          country: business?.country || '',
          goals: goals?.selected || [],
          customGoal: goals?.custom || '',
        }));
      }
    };
    hydrate();
  }, []);

  useEffect(() => {
    if (currentStep !== TOTAL_STEPS) return;
    refreshSocialAccounts();
  }, [currentStep, searchParams]);

  return (
    <OnboardingLayout>
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {currentStep === 1 && (
        <StepOneOnboarding
          formData={formData}
          inputChange={handleChange}
          onNext={handleProfileNext}
          onSkip={handleSetupLater}
          isLoading={loadingAction === 'step1-submit'}
        />
      )}

      {currentStep === 2 && (
        <StepTwoOnboarding
          formData={formData}
          change={handleChange}
          onNext={handleBusinessNext}
          onSkip={handleSetupLater}
          isLoading={loadingAction === 'step2-submit'}
        />
      )}

      {currentStep === 3 && (
        <StepThreeOnboarding
          formData={formData}
          toggleGoal={toggleGoal}
          change={handleChange}
          onNext={handleGoalsNext}
          onSkip={handleSetupLater}
          isLoading={loadingAction === 'step3-submit'}
        />
      )}

      {currentStep === 4 && (
        <StepConnectOnboarding
          socialAccounts={socialAccounts}
          loadingAction={loadingAction}
          handleConnectSocial={handleConnectSocial}
          onSkip={handleSetupLater}
          onComplete={handleComplete}
          isCompleting={loadingAction === 'complete' || loadingAction === 'setup-later'}
        />
      )}
    </OnboardingLayout>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
        </div>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  );
}
