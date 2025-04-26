
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
import LoadingSpinner from "@/components/ui/LoadingSpinner";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Add global retry configuration
        retry: 1,
        staleTime: 5000,
      }
    }
  });
  
  // Create a deep copy of routes to avoid modifying the original
  const routes = JSON.parse(JSON.stringify(baseRoutes));
  
  // Applying ErrorBoundary at the root to catch any unhandled errors
  routes[0].element = (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <ThemeProvider defaultTheme="light" storageKey="allora-theme-preference">
              <Suspense fallback={
                <div className="flex items-center justify-center h-screen">
                  <LoadingSpinner size={40} label="Loading application..." />
                </div>
              }>
                <Toaster richColors closeButton position="top-right" />
                {routes[0].children}
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
