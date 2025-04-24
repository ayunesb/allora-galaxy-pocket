
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AgentMemoryList from '../components/AgentMemoryList';

interface AgentDetailProps {}

export default function AgentDetail({}: AgentDetailProps) {
  const { id } = useParams<{ id: string }>();
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', id, tenant?.id],
    queryFn: async () => {
      if (!tenant?.id || !id) return null;
      
      const { data, error } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching agent:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!tenant?.id && !!id
  });

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading agent details...</div>;
  }

  if (!agent) {
    return <div className="container mx-auto p-6">Agent not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{agent.agent_name}</h1>
          <p className="text-muted-foreground">{agent.role}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agent Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium">Role</div>
                    <div className="text-sm text-muted-foreground">{agent.role || 'No role specified'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Tone</div>
                    <div className="text-sm text-muted-foreground">{agent.tone || 'No tone specified'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Language</div>
                    <div className="text-sm text-muted-foreground">{agent.language || 'English'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="text-5xl font-bold">{agent.memory_score || 0}</div>
                  <div className="text-2xl text-muted-foreground ml-2">/100</div>
                </div>
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Last updated: {new Date(agent.last_memory_update).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="memory">
          <AgentMemoryList agentName={agent.agent_name} />
        </TabsContent>

        <TabsContent value="prompts">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Prompt management functionality will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Performance metrics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
