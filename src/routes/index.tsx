
import { Routes, Route } from "react-router-dom";
import App from "../App";
import LoginPage from "../pages/auth/Login";
import SignupPage from "../pages/auth/Signup";
import DashboardPage from "../pages/dashboard";
import RequireAuth from "../components/RequireAuth";
import AdminDashboard from "../pages/admin/AdminDashboard";
import PluginCenter from "../pages/plugins/PluginCenter";
import CompanyInfo from "../pages/onboarding/CompanyInfo";
import CompanyGoals from "../pages/onboarding/Goals";
import SidebarShell from "../layout/SidebarShell";
import KPIPage from "../pages/insights/kpis";
import StrategyVaultPage from "../pages/vault";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />

      {/* Protected routes with sidebar layout */}
      <Route 
        path="/dashboard" 
        element={
          <RequireAuth>
            <SidebarShell>
              <DashboardPage />
            </SidebarShell>
          </RequireAuth>
        } 
      />
      <Route 
        path="/vault" 
        element={
          <RequireAuth>
            <SidebarShell>
              <StrategyVaultPage />
            </SidebarShell>
          </RequireAuth>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <RequireAuth>
            <SidebarShell>
              <AdminDashboard />
            </SidebarShell>
          </RequireAuth>
        } 
      />
      <Route 
        path="/plugins/center" 
        element={
          <RequireAuth>
            <SidebarShell>
              <PluginCenter />
            </SidebarShell>
          </RequireAuth>
        } 
      />
      <Route 
        path="/insights/kpis" 
        element={
          <RequireAuth>
            <SidebarShell>
              <KPIPage />
            </SidebarShell>
          </RequireAuth>
        } 
      />

      {/* Public onboarding routes */}
      <Route path="/onboarding/company" element={<CompanyInfo />} />
      <Route path="/onboarding/goals" element={<CompanyGoals />} />
    </Routes>
  );
}
