
import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { TenantProvider } from "@/hooks/useTenant";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { baseRoutes } from "./routes/appRoutesConfig";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteDebugger } from "./components/RouteDebugger";
import { ErrorState } from "@/components/ui/error-state";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Add global error handling for data fetching
        retry: 1,
        staleTime: 5000,
        errorBoundary: true
      }
    }
  });
  
  const routes = JSON.parse(JSON.stringify(baseRoutes));
  
  routes[0].element = (
    <ErrorBoundary fallbackComponent={<ErrorState />}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <ThemeProvider defaultTheme="light" storageKey="allora-theme-preference">
              <Suspense fallback={<div>Loading application...</div>}>
                <Toaster richColors closeButton position="top-right" />
                {import.meta.env.DEV && <RouteDebugger />}
              </Suspense>
            </ThemeProvider>
          </TenantProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
  
  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
}

export default App;
