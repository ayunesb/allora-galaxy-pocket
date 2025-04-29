import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./pages/auth/Login";
import OnboardingPage from "./pages/onboarding";
import DashboardPage from "./pages/dashboard";
import KPIPage from "./pages/insights/kpis";
import AgentPerformancePage from "./pages/agents/performance";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/insights/kpis" element={<KPIPage />} />
        <Route path="/agents/performance" element={<AgentPerformancePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);