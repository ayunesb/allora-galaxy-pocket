
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPITrackerWithData } from "@/components/KPITracker";
import { KpiCampaignTracker } from "@/components/KpiCampaignTracker";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useCampaignIntegration } from "@/hooks/useCampaignIntegration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const { tenant } = useTenant();
  const { trackCampaignOutcome } = useCampaignIntegration();

  const { data: strategies } = useQuery({
    queryKey: ["strategies", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("tenant_id", tenant.id)
        .limit(5);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });

  const { data: campaigns } = useQuery({
    queryKey: ["campaigns", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("tenant_id", tenant.id)
        .limit(5);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });

  React.useEffect(() => {
    // Check for active campaigns that need outcome tracking
    if (campaigns && campaigns.length > 0) {
      const activeCampaigns = campaigns.filter(camp => camp.status === 'active');
      
      for (const campaign of activeCampaigns) {
        trackCampaignOutcome(campaign.id);
      }
    }
  }, [campaigns, trackCampaignOutcome]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>KPI Metrics</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <KPITrackerWithData />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <KpiCampaignTracker />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="approved">
              <TabsList className="mb-4">
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
              
              <TabsContent value="approved">
                {strategies?.filter(s => s.status === 'approved').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No approved strategies yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {strategies?.filter(s => s.status === 'approved').map(strategy => (
                      <div key={strategy.id} className="border rounded-md p-3">
                        <h3 className="font-medium">{strategy.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {strategy.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="pending">
                {strategies?.filter(s => s.status === 'pending').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending strategies
                  </div>
                ) : (
                  <div className="space-y-4">
                    {strategies?.filter(s => s.status === 'pending').map(strategy => (
                      <div key={strategy.id} className="border rounded-md p-3">
                        <h3 className="font-medium">{strategy.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {strategy.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Campaign Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                {campaigns?.filter(c => c.status === 'active').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active campaigns
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns?.filter(c => c.status === 'active').map(campaign => (
                      <div key={campaign.id} className="border rounded-md p-3">
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {campaign.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="draft">
                {campaigns?.filter(c => c.status === 'draft').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No draft campaigns
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns?.filter(c => c.status === 'draft').map(campaign => (
                      <div key={campaign.id} className="border rounded-md p-3">
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {campaign.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed">
                {campaigns?.filter(c => c.status === 'completed').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No completed campaigns
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns?.filter(c => c.status === 'completed').map(campaign => (
                      <div key={campaign.id} className="border rounded-md p-3">
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {campaign.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
