
import React from 'react';
import AppRoutes from './AppRoutes';
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
    <ThemeProvider defaultTheme="light" storageKey="allora-theme-preference">
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
