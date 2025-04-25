
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/hooks/useAuth";
import { TenantProvider } from "@/hooks/useTenant";
import { Routes, Route, useRoutes } from "react-router-dom";
import routes from "./routes";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";

function AppRoutes() {
  const queryClient = new QueryClient();
  const routeElements = useRoutes(routes);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantProvider>
          <ThemeProvider defaultTheme="light" storageKey="allora-theme-preference">
            <div className="min-h-screen bg-background text-foreground">
              {routeElements}
              <Toaster richColors closeButton position="top-right" />
            </div>
          </ThemeProvider>
        </TenantProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default AppRoutes;
