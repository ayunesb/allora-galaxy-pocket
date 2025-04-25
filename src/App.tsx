
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

// This is the App component that will be used as the root route element
function AppLayout() {
  return (
    <AuthProvider>
      <TenantProvider>
        <Outlet />
        <Toaster richColors closeButton position="top-right" />
      </TenantProvider>
    </AuthProvider>
  );
}

function App() {
  const queryClient = new QueryClient();
  
  // Clone the base routes and add the App component as the root element
  const routes = JSON.parse(JSON.stringify(baseRoutes));
  routes[0].element = <AppLayout />;
  
  const router = createBrowserRouter(routes);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="allora-theme-preference">
        <RouterProvider router={router} />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
