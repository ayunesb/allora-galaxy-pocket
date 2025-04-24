
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ChevronRight, PencilLine, Settings } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { useTenant } from "@/hooks/useTenant";
import { AgentInfoCard } from "./AgentInfoCard";
import { CampaignExecutionMetrics } from "./CampaignExecutionMetrics";
import { CampaignActionPanel } from "./CampaignActionPanel";
import { CampaignPrediction } from "./CampaignPrediction";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Campaign } from "@/types/campaign";

interface CampaignDetailProps {
  id?: string;
}

export default function CampaignDetail({ id }: CampaignDetailProps) {
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: campaign, isLoading, error, refetch } = useQuery({
    queryKey: ['campaign-detail', id, tenant?.id],
    queryFn: async () => {
      if (!id || !tenant?.id) return null;

      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .eq('tenant_id', tenant.id)
          .single();

        if (error) throw error;
        return data as Campaign;
      } catch (err) {
        console.error("Error in campaign detail query:", err);
        throw err;
      }
    },
    enabled: !!id && !!tenant?.id,
  });

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 mr-2" />
        <span>Loading campaign details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error loading campaign</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => refetch()}
          variant="outline"
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="mb-4">
          <AlertTitle>Campaign not found</AlertTitle>
          <AlertDescription>
            The requested campaign could not be found or you don't have permission to view it.
          </AlertDescription>
        </Alert>
        <Button 
          variant="default" 
          onClick={() => navigate('/campaigns')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/campaigns">Campaigns</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>{campaign.name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      {/* Campaign Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <Badge variant={campaign.status === 'active' ? 'default' : 'outline'}>
              {campaign.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{campaign.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <PencilLine className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" /> Settings
          </Button>
        </div>
      </div>
      
      {/* Agent Info (if present) */}
      {campaign.generated_by_agent_id && <AgentInfoCard />}
      
      {/* Campaign Content */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <CampaignExecutionMetrics campaign={campaign} isLoading={isLoading} />
              <CampaignPrediction campaign={campaign} />
            </div>
            <div>
              <CampaignActionPanel campaign={campaign} onRefresh={handleRefresh} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <CampaignExecutionMetrics campaign={campaign} isLoading={isLoading} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Content</CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.scripts && Object.keys(campaign.scripts).length > 0 ? (
                <div className="grid gap-4">
                  {Object.entries(campaign.scripts).map(([channel, script]) => (
                    <div key={channel} className="border p-4 rounded-lg">
                      <h3 className="font-medium text-base capitalize mb-2">{channel}</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{String(script)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No content scripts available for this campaign
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="h-[400px]">
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Campaign performance charts will display here
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <CampaignPrediction campaign={campaign} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Related Campaigns Section */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Related Campaigns</h2>
          <Button variant="link" size="sm">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base">Email Follow-up Series</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">
                5-part email nurture series for new leads
              </p>
              <div className="mt-2 flex justify-between items-center">
                <Badge variant="outline">Active</Badge>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base">Social Media Burst</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">
                Coordinated posting across platforms
              </p>
              <div className="mt-2 flex justify-between items-center">
                <Badge variant="outline">Draft</Badge>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base">Webinar Promotion</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">
                Promotion for upcoming workshop event
              </p>
              <div className="mt-2 flex justify-between items-center">
                <Badge variant="outline">Paused</Badge>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
