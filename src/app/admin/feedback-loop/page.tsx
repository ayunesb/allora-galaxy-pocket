
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, BarChart } from "lucide-react";
import { format } from "date-fns";

export default function FeedbackLoopDashboard() {
  const [activeTab, setActiveTab] = React.useState("agents");

  const { data: agentFeedback = [] } = useQuery({
    queryKey: ['agent-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: strategyFeedback = [] } = useQuery({
    queryKey: ['strategy-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategy_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate average ratings by agent
  const agentRatings = React.useMemo(() => {
    const agentData: Record<string, { count: number, total: number, average: number }> = {};
    
    agentFeedback.forEach(feedback => {
      if (!feedback.agent) return;
      
      if (!agentData[feedback.agent]) {
        agentData[feedback.agent] = { count: 0, total: 0, average: 0 };
      }
      
      agentData[feedback.agent].count += 1;
      agentData[feedback.agent].total += feedback.rating || 0;
      agentData[feedback.agent].average = 
        agentData[feedback.agent].total / agentData[feedback.agent].count;
    });
    
    return agentData;
  }, [agentFeedback]);

  // Group strategy feedback by strategy title
  const strategyActions = React.useMemo(() => {
    const strategies: Record<string, string[]> = {};
    
    strategyFeedback.forEach(feedback => {
      if (!feedback.strategy_title) return;
      
      if (!strategies[feedback.strategy_title]) {
        strategies[feedback.strategy_title] = [];
      }
      
      if (feedback.action) {
        strategies[feedback.strategy_title].push(feedback.action);
      }
    });
    
    return strategies;
  }, [strategyFeedback]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Feedback Loop Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Agent Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agentFeedback.length}</div>
            <p className="text-muted-foreground">Total feedback entries</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              Strategy Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Object.keys(strategyActions).length}</div>
            <p className="text-muted-foreground">Strategies with feedback</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-blue-500" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Object.keys(agentRatings).length > 0 ? 
                (Object.values(agentRatings).reduce((sum, item) => sum + item.average, 0) / 
                  Object.keys(agentRatings).length).toFixed(1) : 
                "N/A"}
            </div>
            <p className="text-muted-foreground">Average rating across agents</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="agents">Agent Feedback</TabsTrigger>
          <TabsTrigger value="strategies">Strategy Actions</TabsTrigger>
          <TabsTrigger value="improvements">Improvement Loop</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Feedback Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(agentRatings).length > 0 ? (
                  Object.entries(agentRatings).map(([agent, stats]) => (
                    <div key={agent} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{agent}</h3>
                        <Badge variant={stats.average >= 4 ? "success" : 
                                       stats.average >= 3 ? "default" : 
                                       "destructive"}>
                          {stats.average.toFixed(1)} / 5
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Based on {stats.count} feedback entries
                      </div>
                      <div className="mt-2 bg-gray-100 dark:bg-gray-800 h-2 rounded-full">
                        <div 
                          className={`h-full rounded-full ${
                            stats.average >= 4 ? "bg-green-500" : 
                            stats.average >= 3 ? "bg-blue-500" : 
                            "bg-red-500"
                          }`}
                          style={{ width: `${(stats.average / 5) * 100}%` }}
                        />
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Recent Feedback:</h4>
                        <ul className="space-y-1 text-sm">
                          {agentFeedback
                            .filter(f => f.agent === agent)
                            .slice(0, 3)
                            .map((f, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-muted-foreground">{f.rating}/5:</span>
                                <span>{f.feedback || "No comment"}</span>
                              </li>
                            ))
                          }
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No agent feedback yet</AlertTitle>
                    <AlertDescription>
                      Agent feedback will appear here as it's collected from strategy execution.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="strategies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Action History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(strategyActions).length > 0 ? (
                  Object.entries(strategyActions).map(([strategy, actions]) => (
                    <div key={strategy} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{strategy}</h3>
                      <div className="space-y-2">
                        {actions.map((action, i) => (
                          <div key={i} className="bg-muted p-3 rounded-md flex items-start gap-2">
                            <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                            <span className="text-sm">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No strategy actions recorded</AlertTitle>
                    <AlertDescription>
                      Strategy actions will appear here as campaigns are executed.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="improvements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Improvement Loop</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Campaign Performance Metrics</h3>
                
                <div className="space-y-4">
                  {/* Sample metrics could be loaded from KPI insights */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg. Conversion Rate</span>
                    <Badge variant="outline">2.8%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Campaign Success Rate</span>
                    <Badge variant="outline">65%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg. Strategy Impact Score</span>
                    <Badge variant="outline">83/100</Badge>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Learnings Applied</h3>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded-md">
                    <div className="font-medium mb-1">Email campaigns have 2.4x better engagement</div>
                    <div className="text-sm text-muted-foreground">
                      Applied to 3 strategies in the last 30 days
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="font-medium mb-1">Social posts perform best on Tuesdays</div>
                    <div className="text-sm text-muted-foreground">
                      Applied to 5 campaigns in the last 30 days
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="font-medium mb-1">Content length optimization</div>
                    <div className="text-sm text-muted-foreground">
                      Applied to 7 strategies in the last 30 days
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Recent System Improvements</h3>
                <div className="space-y-3">
                  {/* This could be populated from system_logs */}
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">Campaign Content Generator Tuning</div>
                      <Badge>1 day ago</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Optimized prompt for more actionable campaign scripts
                    </div>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">Strategy Evaluation Metrics Updated</div>
                      <Badge>5 days ago</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Added deeper KPI tracking to measure campaign impact
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
