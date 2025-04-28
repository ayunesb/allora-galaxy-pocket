
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AgentPerformanceChart from './AgentPerformanceChart';
import PromptPerformanceStats from '../components/PromptPerformanceStats';
import { useAgentStats, AgentStats } from './hooks/useAgentStats';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AgentPerformanceDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<string>('successRate');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  
  const { stats, loading, error } = useAgentStats();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading agent performance data</p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }
  
  // Extract agent names for filtering
  const agentNames = ['all', ...Array.from(new Set(stats.map(stat => stat.agentName)))];
  
  // Filter agents based on selection
  const filteredStats = selectedAgent === 'all' 
    ? stats 
    : stats.filter(stat => stat.agentName === selectedAgent);
  
  // Calculate overall metrics
  const totalTasks = filteredStats.reduce((sum, stat) => sum + stat.totalTasks, 0);
  const avgSuccessRate = filteredStats.length 
    ? filteredStats.reduce((sum, stat) => sum + stat.successRate, 0) / filteredStats.length 
    : 0;
  const avgExecutionTime = filteredStats.length 
    ? filteredStats.reduce((sum, stat) => sum + stat.averageExecutionTime, 0) / filteredStats.length 
    : 0;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Agent Performance Dashboard</h1>
        
        <div className="flex items-center gap-4">
          <Select value={selectedAgent} onValueChange={(value) => setSelectedAgent(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by agent" />
            </SelectTrigger>
            <SelectContent>
              {agentNames.map(agent => (
                <SelectItem key={agent} value={agent}>
                  {agent === 'all' ? 'All Agents' : agent}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
              <Badge className="ml-2" variant={avgSuccessRate > 85 ? "default" : "outline"}>
                {avgSuccessRate > 85 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Execution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgExecutionTime.toFixed(1)}ms</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="successRate">Success Rate</SelectItem>
                    <SelectItem value="averageExecutionTime">Execution Time</SelectItem>
                    <SelectItem value="totalTasks">Total Tasks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="h-[350px]">
                <AgentPerformanceChart 
                  data={filteredStats} 
                  metric={selectedMetric}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prompts" className="space-y-4">
          {filteredStats.map(agent => (
            <div key={agent.agentName}>
              <PromptPerformanceStats agentName={agent.agentName} />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
