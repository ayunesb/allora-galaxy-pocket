
import React, { useEffect } from 'react';
import AppRoutes from './AppRoutes';
import { TenantProvider } from './hooks/useTenant';
import { ThemeProvider } from './components/ui/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MaintenanceMode } from './components/MaintenanceMode';
import EnhancedErrorBoundary from './components/EnhancedErrorBoundary';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from "@/components/ui/sonner";
import { useSystemInit } from './hooks/useSystemInit';
import { toast } from "@/components/ui/sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    },
  },
});

export default function App() {
  const { isInitializing, isInitialized, error } = useSystemInit();

  useEffect(() => {
    if (isInitialized) {
      toast.success("System initialized successfully", {
        description: "All required tables and configurations are ready."
      });
    }
  }, [isInitialized]);

  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedErrorBoundary>
        <AuthProvider>
          <TenantProvider>
            <ThemeProvider defaultTheme="light" storageKey="allora-theme-preference">
              <MaintenanceMode>
                <AppRoutes />
                <Toaster position="top-right" />
              </MaintenanceMode>
            </ThemeProvider>
          </TenantProvider>
        </AuthProvider>
      </EnhancedErrorBoundary>
    </QueryClientProvider>
  );
}
