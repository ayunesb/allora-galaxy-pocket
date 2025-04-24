
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export function PerformancePanel() {
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      try {
        // Fetch agent performance metrics
        const { data: agentData, error: agentError } = await supabase
          .from('agent_profiles')
          .select('agent_name, memory_score')
          .order('memory_score', { ascending: false });
          
        if (agentError) throw agentError;
        
        // Fetch CRON job metrics
        const { data: cronData, error: cronError } = await supabase
          .from('cron_job_metrics')
          .select('function_name, success_rate, error_count, total_executions');
          
        if (cronError) throw cronError;
        
        // Fetch campaign performance metrics
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('name, execution_status')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (campaignError) throw campaignError;
        
        // Calculate overall system health score
        const agentScore = agentData && agentData.length > 0 
          ? agentData.reduce((sum, agent) => sum + (agent.memory_score || 0), 0) / agentData.length 
          : 0;
          
        const jobSuccessRate = cronData && cronData.length > 0
          ? cronData.reduce((sum, job) => sum + (job.success_rate || 0), 0) / cronData.length
          : 0;
          
        const campaignSuccessCount = campaignData 
          ? campaignData.filter(c => c.execution_status === 'completed').length
          : 0;
          
        const campaignScore = campaignData && campaignData.length > 0
          ? (campaignSuccessCount / campaignData.length) * 100
          : 0;
          
        // Calculate weighted system health score
        const systemHealth = (agentScore * 0.4) + (jobSuccessRate * 0.4) + (campaignScore * 0.2);
        
        return {
          agents: agentData || [],
          jobs: cronData || [],
          campaigns: campaignData || [],
          systemHealth: Math.round(systemHealth),
          jobSuccessRate: Math.round(jobSuccessRate * 100),
          campaignSuccessRate: Math.round(campaignScore)
        };
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
        throw error;
      }
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>AI agents and job performance analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const data = performanceData || { 
    agents: [], 
    jobs: [], 
    campaigns: [], 
    systemHealth: 0,
    jobSuccessRate: 0,
    campaignSuccessRate: 0
  };
  
  // Prepare data for pie chart
  const healthScore = [
    { name: 'Health', value: data.systemHealth },
    { name: 'Gap', value: 100 - data.systemHealth }
  ];
  
  // Colors for the pie chart
  const COLORS = ['#4f46e5', '#e2e8f0'];
  
  // Prepare data for bar charts
  const agentPerformance = data.agents.map(agent => ({
    name: agent.agent_name,
    score: agent.memory_score || 0
  })).slice(0, 5); // Take top 5
  
  const jobPerformance = data.jobs.map(job => ({
    name: job.function_name,
    successRate: Math.round((job.success_rate || 0) * 100),
    errorCount: job.error_count || 0,
    executions: job.total_executions || 0
  })).slice(0, 5); // Take top 5

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Performance</CardTitle>
        <CardDescription>AI agents and job performance analytics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium mb-2">System Health Score</h3>
            <div className="h-40 w-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthScore}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {healthScore.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-2xl font-bold">{data.systemHealth}%</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Overall system performance score based on AI agents, jobs, and campaigns
            </div>
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-sm font-medium mb-2">Job Success Rate</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative h-24 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${data.jobSuccessRate}%` }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="text-lg font-bold">{data.jobSuccessRate}%</div>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              {data.jobs.length} scheduled jobs tracked in the system
            </div>
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-sm font-medium mb-2">Campaign Success Rate</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative h-24 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${data.campaignSuccessRate}%` }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="text-lg font-bold">{data.campaignSuccessRate}%</div>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              {data.campaigns.length} recent campaigns analyzed
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="agents">
          <TabsList className="mb-4">
            <TabsTrigger value="agents">AI Agent Performance</TabsTrigger>
            <TabsTrigger value="jobs">Job Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents">
            <div className="h-64">
              {agentPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" name="Memory Score" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No agent performance data available
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="jobs">
            <div className="h-64">
              {jobPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobPerformance}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="successRate" name="Success Rate (%)" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No job performance data available
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
