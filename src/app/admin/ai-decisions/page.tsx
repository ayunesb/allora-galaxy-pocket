
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DecisionFilters } from "./components/DecisionFilters";
import { DecisionList } from "./components/DecisionList";
import { ApprovalStatsTable } from "./components/ApprovalStatsTable";
import { Strategy } from "@/types/strategy";

const AIDecisionsPage: React.FC = () => {
  const [decisions, setDecisions] = useState<Strategy[]>([]);
  const [filters, setFilters] = useState({
    agentFilter: "all",
    approvalType: "all",
    dateRange: "all",
  });

  useEffect(() => {
    fetchData().then(data => setDecisions(data));
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading strategies:', error);
      return [];
    }
    
    // Transform database results to match Strategy interface with all required fields
    return (data || []).map(item => ({
      id: item.id,
      title: item.title || "",
      description: item.description || "",
      status: item.status || "draft",
      tenant_id: item.tenant_id,
      user_id: item.user_id || "",
      tags: item.tags || [],
      created_at: item.created_at,
      updated_at: item.updated_at || item.created_at,
      generated_by: item.generated_by || 'CEO Agent',
      assigned_agent: item.assigned_agent || '',
      auto_approved: item.auto_approved || false,
      approved_at: item.approved_at || null,
      failure_reason: item.failure_reason || null,
      impact_score: item.impact_score || 0,
      health_score: item.health_score || 0,
      is_public: item.is_public || false,
      diagnosis: item.diagnosis || {},
      metrics_target: item.metrics_target || {},
      metrics_baseline: item.metrics_baseline || {},
      version: item.version || 1,
      reason_for_recommendation: item.reason_for_recommendation || '',
      target_audience: item.target_audience || '',
      goals: item.goals || [],
      channels: item.channels || [],
      kpis: item.kpis || [],
      industry: item.industry || '',
      confidence: item.confidence || null,
    } as Strategy));
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">AI Decision Center</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <DecisionFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>
        <div className="md:col-span-2">
          <ApprovalStatsTable strategies={decisions} />
          <DecisionList decisions={decisions} filters={filters} />
        </div>
      </div>
    </div>
  );
};

export default AIDecisionsPage;
