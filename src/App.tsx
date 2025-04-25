
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { TenantProvider } from "@/hooks/useTenant";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import appRoutes from "./AppRoutes";

function App() {
  const queryClient = new QueryClient();
  const router = createBrowserRouter(appRoutes);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="allora-theme-preference">
        <AuthProvider>
          <TenantProvider>
            <RouterProvider router={router} />
            <Toaster richColors closeButton position="top-right" />
          </TenantProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
