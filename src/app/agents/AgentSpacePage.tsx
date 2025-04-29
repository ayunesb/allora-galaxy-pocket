
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useTenant } from "@/hooks/useTenant";
import { Loader2, Brain, Zap, RefreshCw } from "lucide-react";
import AgentProfileEditor from "./components/AgentProfileEditor";
import { useAgentProfile } from "./hooks/useAgentProfile";
import { AgentCollaborationHub } from "./components/AgentCollaborationHub";
import AgentBlueprintCount from "./AgentBlueprintCount";
import InsertMissingBlueprints from "./InsertMissingBlueprints";
import { supabase } from "@/integrations/supabase/client";
import { AgentMemory } from "@/types/agent";
import { Button } from "@/components/ui/button";
import { MemoryScoreIndicator } from "./components/MemoryScoreIndicator";
import AgentTabs from "./AgentTabs";

export default function AgentSpacePage() {
  const permissions = useRolePermissions();
  const isAdmin = permissions.canManageUsers;
  const { tenant } = useTenant();
  const { data: agent, isLoading } = useAgentProfile();
  const [memoryStats, setMemoryStats] = useState<{
    count: number,
    avgXp: number,
    lastUpdated: string | null
  }>({
    count: 0,
    avgXp: 0,
    lastUpdated: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!tenant?.id || !agent?.agent_name) return;
    
    fetchMemoryStats();
  }, [tenant?.id, agent?.agent_name]);

  const fetchMemoryStats = async () => {
    if (!tenant?.id || !agent?.agent_name) return;
    
    try {
      setIsRefreshing(true);
      
      const { data: memoryData, error: memoryError } = await supabase
        .from("agent_memory")
        .select("xp_delta")
        .eq("tenant_id", tenant.id)
        .eq("agent_name", agent.agent_name);
      
      if (memoryError) throw memoryError;

      const count = memoryData?.length || 0;
      const totalXp = memoryData?.reduce((sum, item) => sum + (item.xp_delta || 0), 0) || 0;
      const avgXp = count > 0 ? Math.round(totalXp / count) : 0;
      
      const { data: latestMemory } = await supabase
        .from("agent_memory")
        .select("timestamp")
        .eq("tenant_id", tenant.id)
        .eq("agent_name", agent.agent_name)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();
      
      setMemoryStats({
        count,
        avgXp,
        lastUpdated: latestMemory?.timestamp || null
      });
      
    } catch (err) {
      console.error("Error fetching agent memory stats:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const optimizeMemory = async () => {
    if (!tenant?.id || !agent?.id) return;
    
    try {
      setIsRefreshing(true);
      
      const { data, error } = await supabase
        .rpc('update_agent_memory_score', { p_agent_id: agent.id });
        
      if (error) throw error;
      
      await fetchMemoryStats();
      
    } catch (err) {
      console.error("Error optimizing agent memory:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>Loading agent profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Agent Space</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <AgentBlueprintCount />
        <InsertMissingBlueprints />
      </div>

      <div className="space-y-8">
        <div className="mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Agent Memory & Performance</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={optimizeMemory}
                disabled={isRefreshing}
                className="flex items-center gap-1"
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                Optimize Memory
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Memory Entries</span>
                  <div className="flex items-center">
                    <Brain className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{memoryStats.count}</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Average XP Gain</span>
                  <div className="flex items-center">
                    <Zap className="mr-2 h-4 w-4 text-amber-500" />
                    <span className="text-2xl font-bold">{memoryStats.avgXp}</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Memory Score</span>
                  {agent?.memory_score !== undefined && (
                    <MemoryScoreIndicator 
                      score={agent.memory_score} 
                      lastUpdate={agent.last_memory_update}
                      className="pt-1" 
                    />
                  )}
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {memoryStats.lastUpdated ? (
                  <>Last memory entry: {new Date(memoryStats.lastUpdated).toLocaleString()}</>
                ) : (
                  <>No memory entries yet</>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <AgentCollaborationHub />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="rounded-lg border bg-card shadow p-4 md:p-6">
              {agent && <AgentTabs agent={agent} />}
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Agent Profile Editor</CardTitle>
            </CardHeader>
            <CardContent>
              {isAdmin ? (
                <AgentProfileEditor agent={agent} />
              ) : (
                <div className="text-muted-foreground text-center py-10">
                  (Admin only)
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
