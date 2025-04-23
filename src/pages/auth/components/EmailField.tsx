
import { Input } from "@/components/ui/input";

interface EmailFieldProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function EmailField({ value, onChange, disabled }: EmailFieldProps) {
  return (
    <div>
      <label
        htmlFor="email"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Email Address
      </label>
      <Input
        id="email"
        aria-label="Email address"
        placeholder="Enter your email"
        type="email"
        aria-required="true"
        autoComplete="email"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
