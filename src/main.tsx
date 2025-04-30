
import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import KPIPage from "./pages/insights/kpis";
import AgentPerformancePage from "./pages/agents/performance";
import PluginMarketplace from "./pages/plugins/marketplace";
import LeadInboxPage from "./pages/leads/inbox";
import ExecuteCampaignPage from "./pages/campaigns/execute";
import StrategyVaultPage from "./pages/vault/index";
import SystemHealthPage from "./pages/system/health";
import AgentMemoryPage from "./pages/agents/memory";
import FeedbackEnginePage from "./pages/feedback/index";
import StrategyRecommenderPage from "./pages/recommender/index";
import BillingPage from "./pages/billing/index";

// Make sure the DOM is fully loaded before attempting to render
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found - DOM might not be ready");
} else {
  const root = createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/insights/kpis" element={<KPIPage />} />
          <Route path="/agents/performance" element={<AgentPerformancePage />} />
          <Route path="/plugins/marketplace" element={<PluginMarketplace />} />
          <Route path="/leads/inbox" element={<LeadInboxPage />} />
          <Route path="/campaigns/execute" element={<ExecuteCampaignPage />} />
          <Route path="/vault" element={<StrategyVaultPage />} />
          <Route path="/system/health" element={<SystemHealthPage />} />
          <Route path="/agents/memory" element={<AgentMemoryPage />} />
          <Route path="/feedback" element={<FeedbackEnginePage />} />
          <Route path="/recommender" element={<StrategyRecommenderPage />} />
          <Route path="/billing" element={<BillingPage />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}
