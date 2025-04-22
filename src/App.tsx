
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import { AuthProvider } from "./hooks/useAuth";
import { TenantProvider } from "./hooks/useTenant";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import AppRoutes from "./AppRoutes";
import { AgentProvider } from "./contexts/AgentContext";
import { PluginProvider } from "./hooks/usePlugins";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <TenantProvider>
            <ThemeProvider defaultTheme="light">
              <AgentProvider>
                <PluginProvider>
                  <AppRoutes />
                  <Toaster position="top-right" />
                </PluginProvider>
              </AgentProvider>
            </ThemeProvider>
          </TenantProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
