
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { TenantProvider } from "@/hooks/useTenant";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { baseRoutes } from "./routes/appRoutesConfig";
import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteDebugger } from "./components/RouteDebugger";

function App() {
  const queryClient = new QueryClient();
  
  // Clone the base routes and prepare for router
  const routes = JSON.parse(JSON.stringify(baseRoutes));
  
  // Set up the root element with all providers in the correct order
  routes[0].element = (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <ThemeProvider defaultTheme="light" storageKey="allora-theme-preference">
              <>
                <Outlet />
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
  
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
}

export default App;
