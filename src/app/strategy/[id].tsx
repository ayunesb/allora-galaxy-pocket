import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Strategy } from "@/types/strategy";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { ToastService } from "@/services/ToastService";
import { AlertCircle, ArrowRight, PlusCircle, LineChart } from "lucide-react";
import { StrategyViewer } from "@/components/StrategyViewer";
import { UnifiedSecurityAlert } from "@/components/security/UnifiedSecurityAlert";
import { StrategyPerformanceTracker } from "@/components/strategy-performance/StrategyPerformanceTracker";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function StrategyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { logActivity } = useSystemLogs();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    if (!id || !tenant?.id) return;

    const fetchStrategyAndCampaigns = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data: strategyData, error: strategyError } = await supabase
          .from('strategies')
          .select('*')
          .eq('id', id)
          .eq('tenant_id', tenant.id)
          .single();

        if (strategyError) throw strategyError;
        
        setStrategy(strategyData);

        await logActivity({
          event_type: 'STRATEGY_VIEWED',
          message: `User viewed strategy: ${strategy.title}`,
          meta: { strategy_id: strategy.id }
        }).then(() => {
          // Successfully logged
        }).catch(err => console.error('Failed to log strategy view:', err));

        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('strategy_id', id)
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });

        if (campaignError) throw campaignError;
        
        setCampaigns(campaignData || []);
        
      } catch (err: any) {
        console.error("Error fetching strategy data:", err);
        setError(err.message || "Failed to load strategy");
        ToastService.error({
          title: "Error loading strategy",
          description: err.message || "Please try again"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStrategyAndCampaigns();
  }, [id, tenant?.id]);

  const handleCreateCampaign = () => {
    if (!strategy) return;
    
    logActivity({
      event_type: "USER_JOURNEY",
      message: "User initiated campaign creation from strategy",
      meta: {
        from: "strategy_detail",
        to: "campaign_create",
        strategy_id: strategy.id
      }
    }).catch(err => console.error("Failed to log activity:", err));
    
    navigate("/campaigns/create", {
      state: {
        strategyId: strategy.id,
        strategyTitle: strategy.title,
        returnPath: `/strategy/${strategy.id}`
      }
    });
  };

  const handleViewCampaign = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

  const handleApprove = async () => {
    try {
      if (strategy.status === 'approved') return;
      
      const { error } = await supabase
        .from('strategies')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', strategy.id);
      
      if (error) throw error;
      
      setStrategy({ ...strategy, status: 'approved' });
      
      ToastService.success({
        title: "Strategy approved",
        description: "You can now create campaigns for this strategy"
      });
      
      await logActivity({
        event_type: "STRATEGY_APPROVED",
        message: `Strategy "${strategy.title}" approved`,
        meta: { strategy_id: strategy.id }
      });
    } catch (err: any) {
      console.error("Error approving strategy:", err);
      ToastService.error({
        title: "Approval failed",
        description: err.message || "Please try again"
      });
    }
  };

  if (loading) {
    return <LoadingOverlay show={true} label="Loading strategy details..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate("/strategy")}>
          Back to Strategies
        </Button>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Strategy not found</AlertTitle>
          <AlertDescription>The requested strategy could not be found.</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate("/strategy")}>
          Back to Strategies
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{strategy.title}</h1>
          <p className="text-muted-foreground">
            {strategy.status === 'approved' ? 'Active Strategy' : 'Pending Strategy'} •{' '}
            Created {new Date(strategy.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={() => navigate("/strategy")}
          >
            Back to Strategies
          </Button>
          {strategy.status === 'approved' && (
            <Button onClick={handleApprove} className="flex gap-2">
              <PlusCircle className="h-4 w-4" /> Create Campaign
            </Button>
          )}
        </div>
      </div>

      {strategy.status !== 'approved' && (
        <UnifiedSecurityAlert
          title="Strategy Pending Approval"
          description="This strategy needs to be approved before campaigns can be created."
          severity="medium"
          source="strategy_system"
          actionable={true}
        />
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 p-1">
          <StrategyViewer 
            strategy={strategy} 
            onApprove={handleApprove}
          />
        </TabsContent>
        
        <TabsContent value="campaigns" className="space-y-6 p-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Strategy Campaigns</CardTitle>
              <CardDescription>
                Campaigns executing this growth strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No campaigns have been created for this strategy yet.</p>
                  {strategy.status === 'approved' && (
                    <Button onClick={handleCreateCampaign} className="flex gap-2 mx-auto">
                      <PlusCircle className="h-4 w-4" /> Create First Campaign
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign: any) => (
                    <Card key={campaign.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row justify-between gap-4 p-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {campaign.description || "No description available"}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              campaign.execution_status === 'in_progress' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                : campaign.execution_status === 'paused'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            }`}>
                              {campaign.execution_status?.toUpperCase() || "PENDING"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Created {new Date(campaign.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-1 self-end md:self-center"
                          onClick={() => handleViewCampaign(campaign.id)}
                        >
                          View <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            {campaigns.length > 0 && strategy.status === 'approved' && (
              <CardFooter className="border-t bg-muted/40 px-6 py-4">
                <Button onClick={handleCreateCampaign} className="flex gap-2">
                  <PlusCircle className="h-4 w-4" /> Create Another Campaign
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="p-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <LineChart className="h-5 w-5" /> Performance Tracking
              </CardTitle>
              <CardDescription>
                Monitor this strategy's impact on key business metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <StrategyPerformanceTracker 
                strategyId={strategy.id} 
                initialMetrics={strategy.metrics_baseline || {}}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
