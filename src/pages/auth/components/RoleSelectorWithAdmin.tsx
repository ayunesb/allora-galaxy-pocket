
import { useState } from "react";
import RoleSelector from "./RoleSelector";
import AdminInviteField from "./AdminInviteField";

interface RoleSelectorWithAdminProps {
  role: string;
  onRoleChange: (role: string) => void;
  adminToken: string;
  onAdminTokenChange: (token: string) => void;
  allowAdmin?: boolean;
  disabled?: boolean;
}

const roleOptionsBase = [
  { value: "client", label: "🧑‍💼 Client (User/Founder)" },
  { value: "developer", label: "👨‍💻 Developer (Agent/Plugin Builder)" },
];

export default function RoleSelectorWithAdmin({
  role,
  onRoleChange,
  adminToken,
  onAdminTokenChange,
  allowAdmin = false,
  disabled
}: RoleSelectorWithAdminProps) {
  const options = allowAdmin
    ? [
        ...roleOptionsBase,
        { value: "admin", label: "👨‍✈️ Admin (System)" },
      ]
    : roleOptionsBase;

  return (
    <>
      <RoleSelector
        value={role}
        onChange={onRoleChange}
        options={options}
        disabled={disabled}
      />
      {role === "admin" && (
        <AdminInviteField value={adminToken} onChange={onAdminTokenChange} disabled={disabled} />
      )}
    </>
  );
}
