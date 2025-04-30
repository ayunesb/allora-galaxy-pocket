import { Routes, Route } from "react-router-dom";
import App from "../App";
import AdminDashboard from "../pages/admin/AdminDashboard";
import OnboardingWelcome from "../pages/onboarding/Welcome";
import OnboardingCompany from "../pages/onboarding/Company";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/onboarding/welcome" element={<OnboardingWelcome />} />
      <Route path="/onboarding/company" element={<OnboardingCompany />} />
    </Routes>
  );
}
