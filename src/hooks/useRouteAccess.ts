
import { useTenant } from "./useTenant";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

export function useRouteAccess() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { role } = useUserRole();

  const canAccessRoute = (route: string): boolean => {
    // Public routes - always accessible
    if (
      route.startsWith("/auth/") ||
      route === "/" ||
      route === "/marketing" ||
      route === "/pricing" ||
      route === "/explore" ||
      route === "/docs" ||
      route.startsWith("/legal/")
    ) {
      return true;
    }

    // Authenticated user check
    if (!user) {
      return false;
    }

    // Workspace page is always accessible to authenticated users
    if (route === "/workspace") {
      return true;
    }

    // Onboarding page is accessible to users with a tenant
    if (route === "/onboarding" && tenant) {
      return true;
    }

    // Need tenant for all other routes
    if (!tenant) {
      return false;
    }

    // Admin-only routes
    if (route.startsWith("/admin/") && role !== "admin") {
      return false;
    }

    // Role-based route access
    if (route.includes("/security-audit/") && !["admin"].includes(role)) {
      return false;
    }

    return true;
  };

  return {
    canAccessRoute
  };
}
