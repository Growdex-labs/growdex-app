export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const PASSWORD_RULES = [
  {
    id: "length",
    label: "8 or more characters",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "lower",
    label: "One lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: "upper",
    label: "One uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "number",
    label: "One number",
    test: (value: string) => /\d/.test(value),
  },
  {
    id: "symbol",
    label: "One symbol",
    test: (value: string) => /[\W_]/.test(value),
  },
] as const;

export const passwordMeetsRules = (value: string) =>
  PASSWORD_PATTERN.test(value);
