
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/invite";

const roleColors: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: "bg-red-100", text: "text-red-800" },
  editor: { bg: "bg-blue-100", text: "text-blue-800" },
  viewer: { bg: "bg-gray-100", text: "text-gray-800" },
  manager: { bg: "bg-amber-100", text: "text-amber-800" }
};

export function RoleLabel({ role }: { role: UserRole }) {
  const colors = roleColors[role];
  
  return (
    <Badge variant="secondary" className={`${colors.bg} ${colors.text}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}
