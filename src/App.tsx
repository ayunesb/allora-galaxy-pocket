import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { TenantProvider } from "@/hooks/useTenant";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import routes from "./routes";
import { Toaster } from "@/components/ui/toaster";
import { useTenant } from "@/hooks/useTenant";
import { useEffect } from "react";
import { SecurityProvider } from './providers/SecurityProvider';

function App() {
  const queryClient = new QueryClient();
  const router = createBrowserRouter(routes);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="allora-theme-preference">
        <AuthProvider>
          <TenantProvider>
            <SecurityProvider>
              <RouterProvider router={router} />
              <Toaster />
            </SecurityProvider>
          </TenantProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
