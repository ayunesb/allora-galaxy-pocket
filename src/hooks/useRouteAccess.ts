
import { useUserRole } from "@/hooks/useUserRole";

const accessMatrix: Record<string, string[]> = {
  client: [
    "/dashboard", 
    "/dashboard/insights", 
    "/dashboard/performance", 
    "/dashboard/kpi", 
    "/dashboard/team-activity", 
    "/dashboard/alerts", 
    "/dashboard/incidents", 
    "/dashboard/startup", 
    "/strategy", 
    "/strategy/:id", 
    "/vault", 
    "/startup", 
    "/campaigns/center", 
    "/campaigns/:id", 
    "/insights/kpis", 
    "/launch", 
    "/assistant", 
    "/notifications", 
    "/creative/suite",
    "/settings"
  ],
  developer: [
    "/dashboard", 
    "/dashboard/insights", 
    "/dashboard/performance", 
    "/dashboard/kpi", 
    "/dashboard/team-activity", 
    "/plugins/builder", 
    "/agents/performance", 
    "/agents", 
    "/creative/suite", 
    "/startup", 
    "/campaigns/center",
    "/settings",
    "/plugins/settings",
    "/plugins/explore",
    "/plugins/my",
    "/plugins/submit",
    "/plugins/revenue/apply",
    "/plugins/builder",
    "/galaxy/create"
  ],
  admin: ["*"]
};

export function useRouteAccess() {
  const { role } = useUserRole();

  const canAccessRoute = (path: string): boolean => {
    if (!role) return false;
    
    // For exact matches
    if (accessMatrix[role]?.includes(path)) return true;
    
    // For wildcard permission
    if (accessMatrix[role]?.includes("*")) return true;
    
    // For paths with parameters (e.g., /strategy/:id)
    const paramPaths = accessMatrix[role]?.filter(p => p.includes(':'));
    if (paramPaths?.length) {
      for (const paramPath of paramPaths) {
        const regex = new RegExp(
          '^' + paramPath.replace(/:[^\/]+/g, '[^\/]+') + '$'
        );
        if (regex.test(path)) return true;
      }
    }
    
    return false;
  };

  return { canAccessRoute };
}
