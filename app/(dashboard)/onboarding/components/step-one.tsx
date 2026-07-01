import { ChangeEvent } from "react";
import { FormDataProps } from "../page";
import { StepHeading, PrimaryButton, SkipLink } from "./onboarding-layout";
import { OnboardingField, FieldBadge } from "./field";

interface StepProfileProps {
  formData: FormDataProps;
  inputChange: (e: ChangeEvent<HTMLInputElement>) => void;
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
          <OnboardingField
            label="Industry"
            name="industry"
            value={formData.industry}
            onChange={inputChange}
            placeholder="Real estate"
          />
          <OnboardingField
            label="Monthly budget"
            name="monthlyBudget"
            value={formData.monthlyBudget}
            onChange={inputChange}
            placeholder="$1,000 - $5,000"
          />
        </div>
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
