import { Check } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/password-rules";

export function PasswordRequirements({ value }: { value: string }) {
  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <li
            key={rule.id}
            className={`flex items-center gap-1.5 text-xs ${
              met ? "text-emerald-700" : "text-gray-500"
            }`}
          >
            <Check
              className={`size-3.5 shrink-0 ${
                met ? "text-emerald-600" : "text-gray-300"
              }`}
              aria-hidden
            />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
