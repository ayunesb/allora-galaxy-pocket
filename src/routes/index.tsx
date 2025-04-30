
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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={
        <RequireAuth children={undefined}>
          <DashboardPage />
        </RequireAuth>
      } />
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <RequireAuth children={undefined}>
          <AdminDashboard />
        </RequireAuth>
      } />
      
      {/* Plugin routes */}
      <Route path="/plugins/center" element={
        <RequireAuth children={undefined}>
          <PluginCenter />
        </RequireAuth>
      } />
      
      {/* Onboarding routes */}
      <Route path="/onboarding/company" element={<CompanyInfo />} />
      <Route path="/onboarding/goals" element={<CompanyGoals />} />
    </Routes>
  );
}
