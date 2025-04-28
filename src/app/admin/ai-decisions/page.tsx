
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { DecisionFilters, FilterState } from "./components/DecisionFilters";
import { DecisionList } from "./components/DecisionList";
import { AuditAnalytics } from "./components/AuditAnalytics";
import { ApprovalMetricsCard } from "./components/ApprovalMetricsCard";
import { ApprovalStatsTable } from "./components/ApprovalStatsTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { ApprovalStats } from "@/types/decision";

export default function AIDecisionsPage() {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: "30",
    agentFilter: "all",
    approvalType: "all"
  });
  
  const { data: strategies, isLoading: strategiesLoading, error: strategiesError } = useQuery({
    queryKey: ['strategies', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });
  
  const { data: approvalStatsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['approval-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('count_strategy_approvals');
        
      if (error) throw error;
      // Cast the result to match ApprovalStats interface
      return data as ApprovalStats;
    }
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const isLoading = strategiesLoading || statsLoading;
  const error = strategiesError || statsError;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorAlert 
        title="Failed to load AI decision data" 
        description={(error as Error).message}
      />
    );
  }

  const approvalStats = approvalStatsData || { total_approved: 0, ai_approved: 0, human_approved: 0 };
  const aiApprovalRate = approvalStats.total_approved > 0 
    ? Math.round((approvalStats.ai_approved / approvalStats.total_approved) * 100) 
    : 0;
    
  const humanApprovalRate = approvalStats.total_approved > 0 
    ? Math.round((approvalStats.human_approved / approvalStats.total_approved) * 100) 
    : 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">AI Decision Monitoring</h1>
      
      <DecisionFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <ApprovalMetricsCard 
          title="Total Approved Strategies" 
          value={approvalStats.total_approved || 0} 
          description="Strategies approved by AI or humans" 
        />
        <ApprovalMetricsCard 
          title="AI Approved" 
          value={approvalStats.ai_approved || 0} 
          description={`${aiApprovalRate}% of total approvals`} 
        />
        <ApprovalMetricsCard 
          title="Human Approved" 
          value={approvalStats.human_approved || 0} 
          description={`${humanApprovalRate}% of total approvals`} 
        />
      </div>
      
      <Tabs defaultValue="decisions" className="mt-8">
        <TabsList>
          <TabsTrigger value="decisions">Decision List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="stats">Approval Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="decisions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <DecisionList 
                decisions={strategies || []} 
                filters={filters} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-4">
          <AuditAnalytics 
            aiApproved={approvalStats.ai_approved || 0}
            humanApproved={approvalStats.human_approved || 0}
          />
        </TabsContent>
        
        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <ApprovalStatsTable strategies={strategies || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
