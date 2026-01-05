import { Check, X } from "lucide-react";

interface PasswordValidatorProps {
  password: string;
}

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Contains number", test: (p: string) => /\d/.test(p) },
  { label: "Contains special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function PasswordValidator({ password }: PasswordValidatorProps) {
  return (
    <div className="space-y-1.5 mt-2">
      {PASSWORD_RULES.map((rule, index) => {
        const passes = rule.test(password);
        return (
          <div
            key={index}
            className={`flex items-center gap-2 text-xs ${
              passes ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            {passes ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {rule.label}
          </div>
        );
      })}
    </div>
  );
}

export function validatePassword(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
