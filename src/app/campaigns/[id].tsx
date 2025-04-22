
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [impressions, setImpressions] = useState("");
  const [delivered, setDelivered] = useState(false);

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      if (!id) throw new Error("Campaign ID is required");
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!tenant?.id
  });

  const { mutate: updateCampaign, isPending } = useMutation({
    mutationFn: async (updates: any) => {
      if (!id) throw new Error("Campaign ID is required");
      
      const { error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      toast({
        title: "Campaign updated",
        description: "Campaign details have been saved"
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  });

  const handleMarkDelivered = () => {
    updateCampaign({ 
      status: 'delivered',
      updated_at: new Date().toISOString() 
    });
    setDelivered(true);
  };

  const handleUpdateImpressions = () => {
    if (!impressions) return;
    
    // Here we would typically update a campaign_metrics or similar table
    // For now, just show a toast
    toast({
      title: "Metrics updated",
      description: `${impressions} impressions recorded for this campaign`
    });
    setImpressions("");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error ? (error as Error).message : "Campaign not found"}
        </div>
      </div>
    );
  }

  const getChannelType = () => {
    const scripts = campaign.scripts || {};
    const channels = Object.keys(scripts);
    
    if (channels.includes('whatsapp')) return 'WhatsApp';
    if (channels.includes('email')) return 'Email';
    if (channels.includes('tiktok')) return 'TikTok';
    if (channels.includes('instagram')) return 'Instagram';
    if (channels.includes('meta')) return 'Meta Ads';
    
    return 'Multiple Channels';
  };

  const getScriptContent = (channel: string) => {
    if (!campaign.scripts) return null;
    return campaign.scripts[channel] || null;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate('/dashboard')}>Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate('/campaign')}>Campaigns</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem isCurrentPage>
          {campaign?.name}
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{campaign.name}</h1>
        <Badge variant={campaign.status === 'active' ? 'default' : 'outline'}>
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">{campaign.description || "No description available"}</p>
            </div>
            <div>
              <h3 className="font-medium">Channel Type</h3>
              <p className="text-sm text-muted-foreground">{getChannelType()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scripts">
        <TabsList className="mb-4">
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scripts" className="space-y-4">
          {campaign.scripts && Object.keys(campaign.scripts).map(channel => (
            <Card key={channel}>
              <CardHeader>
                <CardTitle className="text-md capitalize">{channel}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{getScriptContent(channel)}</p>
              </CardContent>
            </Card>
          ))}
          
          {(!campaign.scripts || Object.keys(campaign.scripts).length === 0) && (
            <p className="text-muted-foreground text-center py-4">No scripts available for this campaign.</p>
          )}
        </TabsContent>
        
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Campaign Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="impressions">Update Impressions</Label>
                  <div className="flex mt-1 gap-2">
                    <Input
                      id="impressions"
                      placeholder="Enter number of impressions"
                      value={impressions}
                      onChange={e => setImpressions(e.target.value)}
                    />
                    <Button onClick={handleUpdateImpressions} disabled={!impressions}>Update</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-center">Campaign history will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/campaign')}
        >
          Back to Campaigns
        </Button>
        
        {campaign?.status === 'active' && !delivered && (
          <Button 
            onClick={handleMarkDelivered}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Mark as Delivered
          </Button>
        )}
      </div>
    </div>
  );
}
