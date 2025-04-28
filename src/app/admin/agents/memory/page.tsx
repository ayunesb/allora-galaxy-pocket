
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import MemoryTable from '@/app/admin/agents/components/MemoryTable';
import { AgentMemory } from '@/types/agent';

export default function AgentMemoryAdmin() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agents, setAgents] = useState<string[]>([]);

  const { data: memories, isLoading } = useQuery({
    queryKey: ['admin-agent-memories', selectedAgent],
    queryFn: async () => {
      let query = supabase
        .from('agent_memory')
        .select('*')
        .order('timestamp', { ascending: false });
        
      if (selectedAgent && selectedAgent !== 'all') {
        query = query.eq('agent_name', selectedAgent);
      }
      
      const { data, error } = await query.limit(100);
      if (error) throw error;
      
      // Process the data to ensure summary and tags exist
      return (data || []).map((item: any) => ({
        ...item,
        summary: item.summary || item.context.substring(0, 100) + (item.context.length > 100 ? "..." : ""),
        tags: item.tags || []
      })) as AgentMemory[];
    }
  });

  // Fetch all unique agent names for filtering
  useEffect(() => {
    async function fetchAgentNames() {
      const { data } = await supabase
        .from('agent_memory')
        .select('agent_name')
        .limit(1000);
        
      if (data) {
        const uniqueAgents = [...new Set(data.map(item => item.agent_name))];
        setAgents(['all', ...uniqueAgents]);
      }
    }
    
    fetchAgentNames();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Agent Memory Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="mb-6" onValueChange={setSelectedAgent}>
            <TabsList className="mb-2">
              {agents.map(agent => (
                <TabsTrigger key={agent} value={agent}>
                  {agent === 'all' ? 'All Agents' : agent}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <MemoryTable logs={memories || []} />
        </CardContent>
      </Card>
    </div>
  );
}
