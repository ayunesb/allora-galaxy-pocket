
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Target, 
  BarChart3,
  ChevronRight,
  Tag
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrategyErrorBoundary } from './components/StrategyErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { StrategyReasonCard } from '@/components/strategy-reason/StrategyReasonCard';
import { Strategy, StrategyStatus } from '@/types/strategy';

const StrategyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: strategyData, isLoading, error } = useQuery({
    queryKey: ['strategy', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Add default values for potentially missing fields
      const enhancedData: Strategy = {
        ...data,
        status: (data.status as StrategyStatus) || 'draft',
        updated_at: data.updated_at || data.created_at,
        version: data.version || 1,
        reason_for_recommendation: data.reason_for_recommendation || '',
        target_audience: data.target_audience || 'No target audience defined.',
        goals: data.goals || [],
        channels: data.channels || [],
        kpis: data.kpis || []
      };
      
      return enhancedData;
    }
  });

  // Use the enhanced strategyData with all required fields
  const strategy = strategyData;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-4" asChild>
            <Link to="/strategy"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Strategy Not Found</CardTitle>
            <CardDescription>
              The strategy you are looking for could not be loaded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/strategy"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Strategies</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'draft': return 'bg-slate-100 text-slate-800';
      case 'rejected': return 'bg-rose-100 text-rose-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <StrategyErrorBoundary>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div className="flex items-center">
            <Button variant="ghost" className="mr-4" asChild>
              <Link to="/strategy"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
            </Button>
            <h1 className="text-2xl font-bold">{strategy.title}</h1>
            <Badge className={`ml-3 ${getStatusColor(strategy.status)}`}>
              {strategy.status?.charAt(0).toUpperCase() + strategy.status?.slice(1) || 'Draft'}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Edit</Button>
            <Button>Create Campaign</Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {strategy.reason_for_recommendation && (
                  <StrategyReasonCard strategy={strategy} />
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {strategy.description || "No description provided."}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Target Audience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-4 rounded-md flex items-start">
                      <Users className="h-5 w-5 mr-3 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium mb-1">Audience Profile</h3>
                        <p className="text-sm text-muted-foreground">
                          {strategy.target_audience || "No target audience defined."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {strategy.goals && strategy.goals.length > 0 ? (
                        strategy.goals.map((goal, index) => (
                          <div key={index} className="bg-muted/50 p-4 rounded-md flex items-start">
                            <Target className="h-5 w-5 mr-3 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm">{goal}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-muted/50 p-4 rounded-md text-center text-muted-foreground">
                          No goals have been defined for this strategy.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Strategy Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm font-medium">{new Date(strategy.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {strategy.updated_at && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Updated</span>
                        <span className="text-sm font-medium">{new Date(strategy.updated_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className={getStatusColor(strategy.status)}>
                        {strategy.status?.charAt(0).toUpperCase() + strategy.status?.slice(1) || 'Draft'}
                      </Badge>
                    </div>
                    
                    {strategy.impact_score !== undefined && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Impact Score</span>
                        <span className="text-sm font-medium">{strategy.impact_score}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Version</span>
                      <span className="text-sm font-medium">{strategy.version || 1}</span>
                    </div>
                    
                    {strategy.is_public !== undefined && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Visibility</span>
                        <span className="text-sm font-medium">{strategy.is_public ? 'Public' : 'Private'}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {strategy.tags && strategy.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {strategy.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No tags added.</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Marketing Channels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {strategy.channels && strategy.channels.length > 0 ? (
                      <div className="space-y-2">
                        {strategy.channels.map((channel, index) => (
                          <div key={index} className="flex items-center">
                            <ChevronRight className="h-4 w-4 text-primary mr-2" />
                            <span>{channel}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No marketing channels defined.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="kpis" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Track and measure strategy success</CardDescription>
              </CardHeader>
              <CardContent>
                {strategy.kpis && strategy.kpis.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {strategy.kpis.map((kpi, index) => (
                      <Card key={index} className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{kpi}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <BarChart3 className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm">No data yet</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No KPIs have been defined</p>
                    <Button variant="outline">Add KPI Metrics</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="campaigns" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Related Campaigns</CardTitle>
                <CardDescription>Campaigns based on this strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No campaigns created yet</p>
                  <Button>Create Campaign</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="versions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>Track changes to your strategy over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium">Version {strategy.version || 1} (Current)</div>
                      <Badge variant="outline">{strategy.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {new Date(strategy.created_at).toLocaleDateString()} • Initial version
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StrategyErrorBoundary>
  );
};

export default StrategyDetail;
