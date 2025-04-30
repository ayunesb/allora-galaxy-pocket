
import { Routes, Route } from "react-router-dom";
import App from "../App";
import LoginPage from "../pages/auth/login";
import SignupPage from "../pages/auth/signup";
import DashboardPage from "../pages/dashboard";
import RequireAuth from "../components/RequireAuth";
import AdminDashboard from "../pages/admin/AdminDashboard";
import PluginCenter from "../pages/plugins/PluginCenter";
import CompanyInfo from "../pages/onboarding/CompanyInfo";
import CompanyGoals from "../pages/onboarding/Goals";
import SidebarShell from "../layout/SidebarShell";
import KPIPage from "../pages/insights/kpis";
import StrategyVaultPage from "../pages/vault/index";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />
      
      {/* Routes with SidebarShell */}
      <Route 
        path="/dashboard" 
        element={
          <RequireAuth children={undefined}>
            <SidebarShell children={undefined}>
              <DashboardPage />
            </SidebarShell>
          </RequireAuth>
        } 
      />
      
      <Route 
        path="/vault" 
        element={
          <RequireAuth children={undefined}>
            <SidebarShell children={undefined}>
              <StrategyVaultPage />
            </SidebarShell>
          </RequireAuth>
        } 
      />
      
      <Route 
        path="/admin" 
        element={
          <RequireAuth children={undefined}>
            <SidebarShell children={undefined}>
              <AdminDashboard />
            </SidebarShell>
          </RequireAuth>
        } 
      />
      
      <Route 
        path="/plugins/center" 
        element={
          <RequireAuth children={undefined}>
            <SidebarShell children={undefined}>
              <PluginCenter />
            </SidebarShell>
          </RequireAuth>
        } 
      />
      
      <Route 
        path="/insights/kpis" 
        element={
          <RequireAuth children={undefined}>
            <SidebarShell children={undefined}>
              <KPIPage />
            </SidebarShell>
          </RequireAuth>
        } 
      />
      
      {/* Onboarding routes */}
      <Route path="/onboarding/company" element={<CompanyInfo />} />
      <Route path="/onboarding/goals" element={<CompanyGoals />} />
    </Routes>
  );
}
