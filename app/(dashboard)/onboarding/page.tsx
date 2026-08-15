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
import { currencyForOnboardingCountry } from '@/lib/onboarding-country';
import { OnboardingLayout } from './components/onboarding-layout';
import { StepProfileOnboarding } from './components/step-profile';
import { StepGoalsOnboarding } from './components/step-goals';
import { StepConnectOnboarding } from './components/step-connect';

export interface FormDataProps {
  // Step 1 — profile and business
  firstName: string;
  lastName: string;
  organizationName: string;
  organizationSize: string;
  website: string;
  country: string;
  industry: string;
  monthlyBudget: string;
  // Step 2 — goals
  goals: string[];
  customGoal: string;
}

const TOTAL_STEPS = 3;

function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');
  const currentStep = stepParam ? Number(stepParam) : 1;

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [countryWasDetected, setCountryWasDetected] = useState(false);

  const [formData, setFormData] = useState<FormDataProps>({
    firstName: '',
    lastName: '',
    organizationName: '',
    organizationSize: '',
    website: '',
    country: '',
    industry: '',
    monthlyBudget: '',
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
    const { name, value } = e.target;

    if (name === 'country') {
      setCountryWasDetected(false);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'country' &&
      currencyForOnboardingCountry(prev.country) !==
        currencyForOnboardingCountry(value)
        ? { monthlyBudget: '' }
        : {}),
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

    setLoadingAction('profile-submit');
    const profile = await savePersonalInfo({
      firstName: formData.firstName,
      lastName: formData.lastName,
      organizationName: formData.organizationName,
      organizationSize: formData.organizationSize || undefined,
    });

    if (!profile.success) {
      setLoadingAction(null);
      setError(profile.error || 'Failed to save information');
      return;
    }

    const business = await saveBusinessInfo({
      businessName: formData.organizationName,
      website: formData.website,
      advertisingBudget: formData.monthlyBudget,
      advertisingBudgetCurrency: currencyForOnboardingCountry(formData.country),
      industry: formData.industry,
      country: formData.country,
    });
    setLoadingAction(null);

    if (!business.success) {
      setError(business.error || 'Failed to save business information');
      return;
    }

    goToStep(2);
  };

  const handleGoalsNext = async () => {
    setError('');

    setLoadingAction('goals-submit');
    const result = await saveMarketingGoals({
      goals: formData.goals,
      customGoal: formData.customGoal,
    });
    setLoadingAction(null);

    if (!result.success) {
      setError(result.error || 'Failed to save marketing goals');
      return;
    }

    goToStep(3);
  };

  const handleConnectSocial = async (platform: SocialPlatform) => {
    setLoadingAction(platform);
    setError('');

    try {
      const result = await connectSocialAccount(platform);
      if (!result.success) {
        setError(result.error || `Failed to connect ${platform}`);
        return;
      }

      if (result.data) {
        setSocialAccounts(result.data);
      } else {
        await refreshSocialAccounts();
      }
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : `Failed to connect ${platform}`,
      );
    } finally {
      setLoadingAction(null);
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
      return;
    }
    setError(res.error || 'Failed to refresh connected accounts');
  };

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const [res, detectedCountryResponse] = await Promise.all([
        fetchOnboardingStatus(),
        fetch('/api/location/country', { cache: 'no-store' })
          .then(async (response) => {
            if (!response.ok) return null;
            const data: unknown = await response.json();
            return (
              typeof data === 'object' &&
              data !== null &&
              typeof (data as { country?: unknown }).country === 'string'
                ? (data as { country: string }).country
                : null
            );
          })
          .catch(() => null),
      ]);

      if (cancelled) return;

      if (res.success && res.data) {
        const { personalInfo, business, goals } = res.data;
        const [first, ...rest] = personalInfo.name.split(' ');
        const existingCountry = business?.country?.trim();
        setFormData((prev) => ({
          ...prev,
          firstName: first || '',
          lastName: rest.join(' ') || '',
          organizationName: personalInfo.organizationName || business?.businessName || '',
          organizationSize: personalInfo.organizationSize || '',
          website: business?.website || '',
          country: existingCountry || detectedCountryResponse || '',
          industry: personalInfo.industry || business?.industry || '',
          monthlyBudget: personalInfo.monthlyBudget || business?.advertisingBudget || '',
          goals: goals?.selected || [],
          customGoal: goals?.custom || '',
        }));
        if (res.data.socialAccounts) {
          setSocialAccounts(res.data.socialAccounts);
        }
        setCountryWasDetected(!existingCountry && Boolean(detectedCountryResponse));
        return;
      }

      if (detectedCountryResponse) {
        setFormData((prev) =>
          prev.country ? prev : { ...prev, country: detectedCountryResponse },
        );
        setCountryWasDetected(true);
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
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
        <StepProfileOnboarding
          formData={formData}
          inputChange={handleChange}
          onNext={handleProfileNext}
          onSkip={handleSetupLater}
          isLoading={loadingAction === 'profile-submit'}
          countryWasDetected={countryWasDetected}
        />
      )}

      {currentStep === 2 && (
        <StepGoalsOnboarding
          formData={formData}
          toggleGoal={toggleGoal}
          change={handleChange}
          onNext={handleGoalsNext}
          onSkip={handleSetupLater}
          isLoading={loadingAction === 'goals-submit'}
        />
      )}

      {currentStep === 3 && (
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
