
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/invite";

const roleColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: "bg-red-100", text: "text-red-800" },
  editor: { bg: "bg-blue-100", text: "text-blue-800" },
  viewer: { bg: "bg-gray-100", text: "text-gray-800" }
};

export function RoleLabel({ role }: { role: UserRole }) {
  const roleKey = role as string;
  const colors = roleColors[roleKey] || { bg: "bg-gray-100", text: "text-gray-800" };
  
  // Convert role to display format
  const displayedRole = (role as string).charAt(0).toUpperCase() + (role as string).slice(1);
  
  return (
    <Badge variant="secondary" className={`${colors.bg} ${colors.text}`}>
      {displayedRole}
    </Badge>
  );
}
