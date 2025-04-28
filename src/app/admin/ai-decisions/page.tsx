
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
    
    // Transform to match Strategy interface
    return (data || []).map(item => ({
      ...item,
      metrics_target: item.metrics_target || {}, // Add missing required field
      metrics_baseline: item.metrics_baseline || {},
      tags: item.tags || [],
      generated_by: item.generated_by || 'CEO Agent',
      assigned_agent: item.assigned_agent || '',
      goals: [], // Add missing required fields
      channels: [],
      kpis: [],
      impact_score: item.impact_score || 0,
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
