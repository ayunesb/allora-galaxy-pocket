
import { useUserRole } from "@/hooks/useUserRole";

const accessMatrix: Record<string, string[]> = {
  client: [
    "/dashboard", 
    "/strategy-gen", 
    "/vault", 
    "/startup", 
    "/campaigns/center", 
    "/insights/kpis", 
    "/launch", 
    "/assistant", 
    "/notifications", 
    "/creative/suite"
  ],
  developer: [
    "/dashboard", 
    "/plugins/builder", 
    "/agents/performance", 
    "/creative/suite", 
    "/startup", 
    "/campaigns/center"
  ],
  admin: ["*"]
};

export function useRouteAccess() {
  const { role } = useUserRole();

  const canAccessRoute = (path: string): boolean => {
    if (!role) return false;
    
    return (
      accessMatrix[role]?.includes(path) ||
      accessMatrix[role]?.includes("*") ||
      path.startsWith("/settings")
    );
  };

  return { canAccessRoute };
}
