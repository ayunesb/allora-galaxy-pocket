import { Routes, Route } from "react-router-dom";
import App from "../App";
import LoginPage from "../pages/auth/login";
import SignupPage from "../pages/auth/signup";
import DashboardPage from "../pages/dashboard";
import RequireAuth from "../components/RequireAuth";

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
      {/* Add the rest here, cleanly scoped */}
    </Routes>
  );
}
