
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ui/theme-provider';
import ResponsiveToastProvider from '@/components/ui/ResponsiveToastProvider';
import App from './App.tsx';
import './index.css';
import RouteDebugger from './components/RouteDebugger';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Router>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="allora-theme">
          <ResponsiveToastProvider>
            <App />
            {import.meta.env.DEV && <RouteDebugger />}
          </ResponsiveToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Router>
  </React.StrictMode>
);
