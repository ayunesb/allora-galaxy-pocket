
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DecisionFilters } from "./components/DecisionFilters";
import { DecisionList } from "./components/DecisionList";
import { ApprovalStatsTable } from "./components/ApprovalStatsTable";
import { Strategy, mapJsonToStrategy } from "@/types/strategy";

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
    
    // Transform database results using the mapper function
    return (data || []).map(mapJsonToStrategy);
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
