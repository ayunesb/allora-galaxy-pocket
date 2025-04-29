
import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { TenantProvider } from "@/hooks/useTenant";
import { BrowserRouter, RouterProvider, createBrowserRouter } from "react-router-dom";
import { baseRoutes } from "./routes/appRoutesConfig";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ResponsiveToastProvider } from "@/components/ui/ResponsiveToastProvider";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
      // Global error handler using new format in latest version
      meta: {
        onError: (error: unknown) => {
          console.error('Query error:', error);
        }
      }
    },
    mutations: {
      // Global error handler using new format
      meta: {
        onError: (error: unknown) => {
          console.error('Mutation error:', error);
        }
      }
    }
  }
});

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TenantProvider>
              <ThemeProvider defaultTheme="light" storageKey="allora-theme-preference">
                <ResponsiveToastProvider>
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-screen">
                      <LoadingSpinner size="lg" label="Loading application..." />
                    </div>
                  }>
                    <RouterProvider router={createBrowserRouter(baseRoutes)} />
                  </Suspense>
                </ResponsiveToastProvider>
              </ThemeProvider>
            </TenantProvider>
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
