import { ChangeEvent } from "react";
import { FormDataProps } from "../page";
import { StepHeading, PrimaryButton, SkipLink } from "./onboarding-layout";
import { OnboardingField, OnboardingSelect, FieldBadge } from "./field";
import { COMPANY_SIZE_OPTIONS, INDUSTRY_OPTIONS, MONTHLY_BUDGET_OPTIONS } from "./options";

type FieldChange = (
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => void;

interface StepProfileProps {
  formData: FormDataProps;
  inputChange: FieldChange;
  onNext: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function StepOneOnboarding({ formData, inputChange, onNext, onSkip, isLoading }: StepProfileProps) {
  const organizationMissing = !formData.organizationName;

  return (
    <div>
      <StepHeading
        title="Manage Your Advertising in One Place"
        subtitle="Create, monitor, and optimize campaigns across multiple platforms."
      />

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <OnboardingField
            label="Your name"
            name="firstName"
            value={formData.firstName}
            onChange={inputChange}
            placeholder="John"
          />
          <OnboardingField
            label="Last name"
            name="lastName"
            value={formData.lastName}
            onChange={inputChange}
            placeholder="Doe"
          />
        </div>

        <OnboardingField
          label="Organization name"
          name="organizationName"
          value={formData.organizationName}
          onChange={inputChange}
          placeholder="Doe Junior"
          required
          badge={organizationMissing ? <FieldBadge>Required</FieldBadge> : undefined}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <OnboardingSelect
            label="Industry"
            name="industry"
            value={formData.industry}
            onChange={inputChange}
            placeholder="Choose an industry"
            options={INDUSTRY_OPTIONS}
          />
          <OnboardingSelect
            label="Monthly budget"
            name="monthlyBudget"
            value={formData.monthlyBudget}
            onChange={inputChange}
            placeholder="Choose a range"
            options={MONTHLY_BUDGET_OPTIONS}
          />
        </div>

        <OnboardingSelect
          label="Company size"
          name="organizationSize"
          value={formData.organizationSize}
          onChange={inputChange}
          placeholder="Choose a size"
          options={COMPANY_SIZE_OPTIONS}
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <PrimaryButton onClick={onNext} disabled={isLoading}>
          {isLoading ? "Saving..." : "Next"}
        </PrimaryButton>
        <SkipLink onClick={onSkip} disabled={isLoading}>
          Setup social accounts later
        </SkipLink>
      </div>
    </div>
  );
}
