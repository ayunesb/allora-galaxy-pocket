
import React from 'react';
import AppRoutes from './AppRoutes';
import { TenantProvider } from './hooks/useTenant';
import { ThemeProvider } from './components/ui/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <ThemeProvider defaultTheme="light" storageKey="allora-theme-preference">
          <AppRoutes />
        </ThemeProvider>
      </TenantProvider>
    </QueryClientProvider>
  );
}
