
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import DecisionFilters from "./components/DecisionFilters";
import DecisionList from "./components/DecisionList";
import AuditAnalytics from "./components/AuditAnalytics";
import ApprovalMetricsCard from "./components/ApprovalMetricsCard";
import ApprovalStatsTable from "./components/ApprovalStatsTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AIDecisionsPage() {
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("30");
  const [agentFilter, setAgentFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "analytics">("list");

  const {
    data: decisions,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ai-decisions", tenant?.id, timeRange, agentFilter, statusFilter],
    queryFn: async () => {
      if (!tenant?.id) return [];

      // Build the query with filters
      let query = supabase
        .from("strategies")
        .select("*")
        .eq("tenant_id", tenant.id);

      // Add time filter
      if (timeRange) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
        query = query.gte("created_at", daysAgo.toISOString());
      }

      // Add agent filter
      if (agentFilter) {
        query = query.eq("generated_by", agentFilter);
      }

      // Add status filter
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      // Get results
      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id,
  });

  const {
    data: approvalStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["approval-stats", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;

      const { data, error } = await supabase.rpc("count_strategy_approvals");

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id,
  });

  const handleFilterChange = (
    time: string,
    agent: string | null,
    status: string | null
  ) => {
    setTimeRange(time);
    setAgentFilter(agent);
    setStatusFilter(status);
  };

  if (isLoading || statsLoading) return <LoadingSpinner />;

  if (error || statsError) {
    return (
      <ErrorAlert
        title="Error loading AI decisions"
        description="There was a problem fetching the AI decisions data"
        retry={() => refetch()}
      />
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="mr-2"
            size="sm"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">AI Decisions Audit</h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
          <Button
            variant={viewMode === "analytics" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("analytics")}
          >
            Analytics
          </Button>
        </div>
      </div>

      {approvalStats && (
        <div className="mb-6">
          <ApprovalMetricsCard
            total={Number(approvalStats.total_approved) || 0}
            aiApproved={Number(approvalStats.ai_approved) || 0}
            humanApproved={Number(approvalStats.human_approved) || 0}
          />
        </div>
      )}

      <Tabs defaultValue="decisions">
        <TabsList className="mb-6">
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
        </TabsList>

        <TabsContent value="decisions">
          <div className="mb-6">
            <DecisionFilters
              timeRange={timeRange}
              agent={agentFilter}
              status={statusFilter}
              onFilterChange={handleFilterChange}
            />
          </div>

          {viewMode === "list" ? (
            <DecisionList decisions={decisions || []} />
          ) : (
            <>
              <AuditAnalytics decisions={decisions || []} />
              {approvalStats && (
                <div className="mt-6">
                  <ApprovalStatsTable
                    aiApproved={Number(approvalStats.ai_approved)}
                    humanApproved={Number(approvalStats.human_approved)}
                    timeRange={timeRange}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="weekly">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Weekly AI Decision Reports</h3>
            <p className="text-muted-foreground">
              View detailed weekly reports and summaries of AI decisions.
            </p>
            <Button
              onClick={() => navigate("/admin/ai-decisions/weekly")}
              className="mt-4"
            >
              View Weekly Reports
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
