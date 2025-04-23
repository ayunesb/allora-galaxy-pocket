
import { Input } from "@/components/ui/input";

interface PasswordFieldProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function PasswordField({ value, onChange, disabled }: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Password
      </label>
      <Input
        id="password"
        aria-label="Password"
        placeholder="Enter your password"
        type="password"
        aria-required="true"
        autoComplete="new-password"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
