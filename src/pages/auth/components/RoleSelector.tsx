
interface RoleOption {
  value: string;
  label: string;
}

interface RoleSelectorProps {
  value: string;
  onChange: (val: string) => void;
  options: RoleOption[];
  disabled?: boolean;
}

export default function RoleSelector({ value, onChange, options, disabled }: RoleSelectorProps) {
  return (
    <div>
      <label
        htmlFor="role"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Select Your Role
      </label>
      <select
        id="role"
        className="w-full p-2 border border-gray-300 rounded mb-4"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        aria-label="User Role"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
