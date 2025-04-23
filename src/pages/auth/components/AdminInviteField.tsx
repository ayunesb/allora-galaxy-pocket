
import { Input } from "@/components/ui/input";

interface AdminInviteFieldProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function AdminInviteField({ value, onChange, disabled }: AdminInviteFieldProps) {
  return (
    <div className="mt-2">
      <label
        htmlFor="admin-invite"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Admin Invite Code
      </label>
      <Input
        id="admin-invite"
        aria-label="Admin Invite Code"
        placeholder="Enter admin invite code"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
