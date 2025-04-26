
import React from "react";
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

function App() {
  const queryClient = new QueryClient();
  
  // Clone the base routes for the router
  const routes = JSON.parse(JSON.stringify(baseRoutes));
  
  // Set up the root element with all providers without RouterProvider
  // We'll only use RouterProvider at the return statement
  routes[0].element = (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <ThemeProvider defaultTheme="light" storageKey="allora-theme-preference">
              <>
                {/* Router is managed at the root level, not here */}
                <Toaster richColors closeButton position="top-right" />
                {import.meta.env.DEV && <RouteDebugger />}
              </>
            </ThemeProvider>
          </TenantProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
  
  // Create the router once and return it
  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
}

export default App;
