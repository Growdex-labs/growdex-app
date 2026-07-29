import { ChangeEvent } from "react";
import { FormDataProps } from "../page";
import { StepHeading, PrimaryButton, SkipLink } from "./onboarding-layout";
import { OnboardingField, OnboardingSelect } from "./field";
import { INDUSTRY_OPTIONS, MONTHLY_BUDGET_OPTIONS } from "./options";

type FieldChange = (
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => void;

interface StepBusinessProps {
  formData: FormDataProps;
  change: FieldChange;
  onNext: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export function StepTwoOnboarding({ formData, change, onNext, onSkip, isLoading }: StepBusinessProps) {
  return (
    <div>
      <StepHeading
        title="Setup your business"
        subtitle="Tell us a bit about your organization so we can tailor your growth strategy."
      />

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <OnboardingField
            label="Business Name"
            name="businessName"
            value={formData.businessName}
            onChange={change}
            placeholder="Enter legal business name"
          />
          <OnboardingField
            label="Website"
            name="website"
            value={formData.website}
            onChange={change}
            placeholder="https://legalbusiness.com"
          />
        </div>

        <OnboardingSelect
          label="Monthly Advertising Budget"
          name="advertisingBudget"
          value={formData.advertisingBudget}
          onChange={change}
          placeholder="Choose a range"
          options={MONTHLY_BUDGET_OPTIONS}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <OnboardingSelect
            label="Industry"
            name="industry"
            value={formData.industry}
            onChange={change}
            placeholder="Choose an industry"
            options={INDUSTRY_OPTIONS}
          />
          <OnboardingField
            label="Country"
            name="country"
            value={formData.country}
            onChange={change}
            placeholder="Spain"
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <PrimaryButton onClick={onNext} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Next'}
        </PrimaryButton>
        <SkipLink onClick={onSkip} disabled={isLoading}>
          I&apos;ll finish this later
        </SkipLink>
      </div>
    </div>
  );
}
