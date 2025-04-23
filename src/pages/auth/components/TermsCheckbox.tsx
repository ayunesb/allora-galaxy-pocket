
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function TermsCheckbox({ checked, onChange, disabled }: TermsCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="terms"
        name="terms"
        aria-label="Accept terms and conditions"
        checked={checked}
        onCheckedChange={val => onChange(val as boolean)}
        disabled={disabled}
      />
      <label
        htmlFor="terms"
        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        I agree to the{" "}
        <Link to="/legal/terms" className="underline" aria-label="View Terms of Use">
          Terms of Use
        </Link>
        ,{" "}
        <Link to="/legal/privacy" className="underline" aria-label="View Privacy Policy">
          Privacy Policy
        </Link>
        , and{" "}
        <Link to="/legal/cookie" className="underline" aria-label="View Cookie Policy">
          Cookie Policy
        </Link>
      </label>
    </div>
  );
}
