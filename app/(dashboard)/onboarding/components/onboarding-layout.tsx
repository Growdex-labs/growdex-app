import { ReactNode } from "react";
import { FloatingLogos } from "./floating-logos";

/**
 * Centered shell for the onboarding 2.0 flow. Provides the top header
 * (brand + menu) and the decorative background, and centers the step content.
 */
export function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f8f8] text-[#333]">
      <FloatingLogos />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1100px] flex-col px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between py-5">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Growdex" className="h-8 w-8" />
            <span className="text-lg font-semibold">Growdex</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl bg-[#333] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#444]"
          >
            Menu
            <span className="flex flex-col gap-[3px]">
              <span className="block h-px w-3 bg-white/80" />
              <span className="block h-px w-3 bg-white/80" />
              <span className="block h-px w-3 bg-white/80" />
            </span>
          </button>
        </header>

        {/* Step content */}
        <main className="flex flex-1 flex-col items-center pt-8 pb-16 sm:pt-12">
          <div className="w-full max-w-[900px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Shared heading block: centered title + subtitle used on each step. */
export function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-10 text-center">
      <h1 className="text-3xl font-normal text-[#333] sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
        {title}
      </h1>
      <p className="mt-3 text-base text-[#666] sm:text-lg">{subtitle}</p>
    </div>
  );
}

/** Primary yellow CTA used across steps. */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-khaki-200 px-7 py-2.5 text-sm font-medium text-[#333] transition-colors hover:bg-khaki-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** Subtle right-aligned "skip" link used across steps. */
export function SkipLink({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-sm text-[#808080] transition-colors hover:text-[#555] disabled:opacity-50"
    >
      {children}
    </button>
  );
}
