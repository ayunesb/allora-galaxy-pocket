
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/invite";

const roleColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: "bg-red-100", text: "text-red-800" },
  editor: { bg: "bg-blue-100", text: "text-blue-800" },
  viewer: { bg: "bg-gray-100", text: "text-gray-800" }
};

export function RoleLabel({ role }: { role: UserRole }) {
  const colors = roleColors[role as string];
  
  return (
    <Badge variant="secondary" className={`${colors.bg} ${colors.text}`}>
      {typeof role === 'string' ? role.charAt(0).toUpperCase() + role.slice(1) : role}
    </Badge>
  );
}
