
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
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { SecurityProvider } from "@/providers/SecurityProvider";

// Create router outside of component to avoid re-creation on renders
const router = createBrowserRouter(baseRoutes);

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5000,
        // Global error handler for all queries
        onError: (error: unknown) => {
          console.error('Query error:', error);
        }
      },
      mutations: {
        // Global error handler for all mutations
        onError: (error: unknown) => {
          console.error('Mutation error:', error);
        }
      }
    }
  });
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <SecurityProvider>
              <ThemeProvider defaultTheme="light" storageKey="allora-theme-preference">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-screen">
                    <LoadingSpinner size="lg" label="Loading application..." />
                  </div>
                }>
                  <Toaster richColors closeButton position="top-right" />
                  <RouterProvider router={router} />
                </Suspense>
              </ThemeProvider>
            </SecurityProvider>
          </TenantProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
