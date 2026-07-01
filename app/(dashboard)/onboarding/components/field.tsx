import { ChangeEvent, ReactNode } from "react";

const boxClasses =
  "bg-[#f9faff] border border-[#c8cbd7] rounded-xl px-3.5 py-2 flex flex-col justify-center min-h-[69px] focus-within:border-khaki-300 focus-within:ring-2 focus-within:ring-khaki-200/40 transition-colors";

const labelClasses = "text-xs text-[#9ca0b0] mb-0.5";
const controlClasses =
  "w-full bg-transparent outline-none text-sm text-[#4d4d4d] placeholder:text-[#c8cbd7]";

interface OnboardingFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  /** Renders a pill on the right side of the field (e.g. "Required"). */
  badge?: ReactNode;
}

export function OnboardingField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  badge,
}: OnboardingFieldProps) {
  return (
    <div className={`${boxClasses} ${badge ? "flex-row items-center justify-between" : ""}`}>
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <label className={labelClasses}>
          {label}
          {required && <span className="text-firebrick-500"> *</span>}
        </label>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={controlClasses}
        />
      </div>
      {badge}
    </div>
  );
}

interface OnboardingSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  options: { label: string; value: string }[];
}

export function OnboardingSelect({
  label,
  name,
  value,
  onChange,
  placeholder,
  options,
}: OnboardingSelectProps) {
  return (
    <div className={`${boxClasses} relative`}>
      <label className={labelClasses}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`${controlClasses} appearance-none pr-6 cursor-pointer ${
          value ? "text-[#4d4d4d]" : "text-[#c8cbd7]"
        }`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-[#4d4d4d]">
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#666]"
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Yellow pill used for the "Required" / status badge inside a field. */
export function FieldBadge({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 bg-dimYellow text-[#8f2708] text-xs font-medium rounded-md px-5 py-1.5">
      {children}
    </span>
  );
}
