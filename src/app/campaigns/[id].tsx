import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useCampaignExecution } from "@/hooks/campaign/useCampaignExecution";
import { 
  AlertCircle, 
  ArrowLeft, 
  Play, 
  Pause,
  BarChart,
  Settings,
  ArrowRight,
  Edit,
  ListChecks,
  Check
} from "lucide-react";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  const { startCampaignExecution, pauseCampaignExecution, status, progress } = useCampaignExecution();
  
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [strategy, setStrategy] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNewlyCreated] = useState(location.state?.newlyCreated || false);
  const returnPath = location.state?.returnPath || "/campaigns";

  useEffect(() => {
    if (!id || !tenant?.id) return;
    
    const fetchCampaignAndStrategy = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .eq('tenant_id', tenant.id)
          .single();
          
        if (campaignError) throw campaignError;
        setCampaign(campaignData);
        
        if (campaignData.strategy_id) {
          const { data: strategyData, error: strategyError } = await supabase
            .from('strategies')
            .select('*')
            .eq('id', campaignData.strategy_id)
            .single();
            
          if (strategyError && strategyError.code !== 'PGRST116') {
            console.error("Error fetching strategy:", strategyError);
          } else {
            setStrategy(strategyData);
          }
        }
        
        await logActivity({
          event_type: "CAMPAIGN_VIEW",
          message: `Campaign "${campaignData.name}" viewed`,
          meta: { campaign_id: id }
        });
      } catch (err: any) {
        console.error("Error fetching campaign data:", err);
        setError(err.message || "Failed to load campaign details");
        toast("Error loading campaign", {
          description: err.message || "Please try again"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaignAndStrategy();
  }, [id, tenant?.id, logActivity]);

  const handleStartExecution = async () => {
    try {
      if (!id) return;
      
      await startCampaignExecution(id);
      
      setCampaign(prev => ({
        ...prev,
        execution_status: 'in_progress',
        execution_start_date: new Date().toISOString()
      }));
      
      toast("Campaign started", {
        description: "Your campaign is now executing"
      });
      
      await logActivity({
        event_type: "CAMPAIGN_EXECUTION_STARTED",
        message: `Campaign "${campaign.name}" execution started`,
        meta: { campaign_id: id }
      });

      setTimeout(() => {
        navigate(`/kpi/dashboard`, { 
          state: { 
            campaignId: id,
            campaignName: campaign.name,
            returnPath: `/campaigns/${id}`
          }
        });
      }, 2000);
      
    } catch (err: any) {
      console.error("Error starting campaign:", err);
      toast("Failed to start campaign", {
        description: err.message || "Please try again"
      });
    }
  };

  const handlePauseExecution = async () => {
    try {
      if (!id) return;
      
      await pauseCampaignExecution(id);
      
      setCampaign(prev => ({
        ...prev,
        execution_status: 'paused'
      }));
      
      toast("Campaign paused", {
        description: "Your campaign execution has been paused"
      });
      
      await logActivity({
        event_type: "CAMPAIGN_EXECUTION_PAUSED",
        message: `Campaign "${campaign.name}" execution paused`,
        meta: { campaign_id: id }
      });
      
    } catch (err: any) {
      console.error("Error pausing campaign:", err);
      toast("Failed to pause campaign", {
        description: err.message || "Please try again"
      });
    }
  };

  if (loading) {
    return <LoadingOverlay show={true} label="Loading campaign..." />;
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Campaign not found. It may have been deleted or you don't have access."}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate(returnPath)}>
          Back
        </Button>
      </div>
    );
  }

  const channelsList = campaign.scripts && typeof campaign.scripts === 'object' 
    ? Object.keys(campaign.scripts.channels || {})
    : [];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {isNewlyCreated && (
        <Alert className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-900">
          <Check className="h-4 w-4" />
          <AlertTitle>Campaign Created Successfully</AlertTitle>
          <AlertDescription>
            Your campaign has been created. Now you can configure it and start execution when ready.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(returnPath)}
            className="flex items-center gap-1 mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant={
                campaign.execution_status === 'in_progress' ? 'default' :
                campaign.execution_status === 'paused' ? 'outline' :
                'secondary'
              }>
                {campaign.execution_status?.toUpperCase() || "PENDING"}
              </Badge>
              <span>•</span>
              <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {campaign.execution_status === 'in_progress' ? (
            <Button 
              variant="outline" 
              onClick={handlePauseExecution}
              className="flex items-center gap-2"
            >
              <Pause className="h-4 w-4" /> Pause Campaign
            </Button>
          ) : (
            <Button 
              onClick={handleStartExecution}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" /> {campaign.execution_status === 'paused' ? 'Resume' : 'Start'} Campaign
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => navigate(`/campaigns/edit/${id}`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      {campaign.description && (
        <p className="text-muted-foreground max-w-3xl">{campaign.description}</p>
      )}
      
      {campaign.execution_status === 'in_progress' && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold">Campaign Execution Progress</h3>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Started {campaign.execution_start_date ? new Date(campaign.execution_start_date).toLocaleDateString() : 'recently'}</span>
                  <span>{progress}% Complete</span>
                </div>
              </div>
              
              <Button
                onClick={() => navigate(`/kpi/dashboard`, { 
                  state: { 
                    campaignId: id,
                    campaignName: campaign.name,
                    returnPath: `/campaigns/${id}`
                  }
                })}
                className="flex items-center gap-2"
                variant="secondary"
              >
                View KPIs <BarChart className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="channels">Channels ({channelsList.length})</TabsTrigger>
          {campaign.execution_status !== 'pending' && (
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 pt-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Basic information about this campaign
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <p>{campaign.execution_status?.toUpperCase() || "PENDING"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                  <p>{new Date(campaign.created_at).toLocaleDateString()}</p>
                </div>
                
                {campaign.execution_start_date && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Execution Started</h3>
                    <p>{new Date(campaign.execution_start_date).toLocaleDateString()}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                  <p>{new Date(campaign.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              {strategy && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Based on Strategy</h3>
                  <Card className="bg-muted/30">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-base">{strategy.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3 px-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {strategy.description || "No description available"}
                      </p>
                    </CardContent>
                    <CardFooter className="py-2 px-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto flex items-center text-xs"
                        onClick={() => navigate(`/strategy/${strategy.id}`)}
                      >
                        View Strategy <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="channels" className="space-y-6 pt-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Channels</CardTitle>
              <CardDescription>
                Marketing channels used in this campaign
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {channelsList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No channels configured for this campaign yet.</p>
                  <Button
                    variant="link"
                    onClick={() => navigate(`/campaigns/edit/${id}/channels`)}
                  >
                    Configure Channels
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {channelsList.map((channel) => (
                    <Card key={channel}>
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="flex justify-between items-center text-lg">
                          {channel.charAt(0).toUpperCase() + channel.slice(1)}
                          <Badge variant="outline">{channel}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-3 px-4">
                        <div className="space-y-2">
                          {campaign.scripts?.channels?.[channel]?.content ? (
                            <div className="text-sm">
                              <p className="text-muted-foreground mb-1">Content:</p>
                              <p className="pl-3 border-l-2 border-primary/20">
                                {campaign.scripts.channels[channel].content}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No content created yet</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-2 pb-6 px-6 flex justify-center border-t">
              <Button
                onClick={() => navigate(`/campaigns/edit/${id}/channels`)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" /> Configure Channels
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {campaign.execution_status !== 'pending' && (
          <TabsContent value="metrics" className="space-y-6 pt-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" /> Campaign Metrics
                </CardTitle>
                <CardDescription>
                  Performance metrics for this campaign
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {campaign.execution_status === 'in_progress' ? (
                  <div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Execution Progress</h3>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Started</span>
                          <span>{progress}% Complete</span>
                        </div>
                      </div>
                      
                      {campaign.metrics && Object.keys(campaign.metrics).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                          {Object.entries(campaign.metrics).map(([key, value]: [string, any]) => (
                            <Card key={key} className="bg-muted/30">
                              <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-1">{key}</p>
                                <p className="text-2xl font-semibold">{value}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-4 text-muted-foreground">
                          Metrics will appear here once the campaign generates data
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <Button
                        onClick={() => navigate(`/kpi/dashboard`, { 
                          state: { 
                            campaignId: id,
                            campaignName: campaign.name,
                            returnPath: `/campaigns/${id}`
                          }
                        })}
                        className="flex items-center gap-2"
                      >
                        <BarChart className="h-4 w-4" /> View Full KPI Dashboard
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      This campaign is currently {campaign.execution_status}. Start or resume the campaign to see metrics.
                    </p>
                    <Button onClick={handleStartExecution} className="flex items-center gap-2">
                      <Play className="h-4 w-4" /> {campaign.execution_status === 'paused' ? 'Resume' : 'Start'} Campaign
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" /> Tasks & Actions
                </CardTitle>
                <CardDescription>
                  Campaign execution tasks and actions
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {campaign.execution_metrics?.tasks?.length > 0 ? (
                    <div className="divide-y">
                      {campaign.execution_metrics.tasks.map((task: any, index: number) => (
                        <div key={index} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {task.completed ? (
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                            )}
                            <span>{task.name}</span>
                          </div>
                          {task.completed && (
                            <Badge variant="outline" className="ml-auto">Completed</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      No tasks recorded for this campaign yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
