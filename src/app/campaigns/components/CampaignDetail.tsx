
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Loader2, ArrowLeft, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CampaignExecutionTracker } from "./CampaignExecutionTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgentContext } from "@/contexts/AgentContext";
import { useCampaignExecution } from "@/hooks/campaign/useCampaignExecution";
import { CampaignScriptPanel } from "./CampaignScriptPanel";

interface CampaignDetailProps {
  id?: string;
}

export default function CampaignDetail({ id }: CampaignDetailProps) {
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState("overview");
  const { agentProfile } = useAgentContext();
  const { startCampaignExecution, pauseCampaignExecution } = useCampaignExecution();
  
  const { data: campaign, isLoading, error, refetch } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      if (!tenant?.id || !id) return null;
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenant.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id && !!id
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 mr-2" />
        <span>Loading campaign data...</span>
      </div>
    );
  }
  
  if (error || !campaign) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <h3 className="font-medium">Error loading campaign</h3>
          <p className="text-sm mt-1">
            {error instanceof Error ? error.message : "Campaign not found"}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          asChild
        >
          <Link to="/campaigns">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to campaigns
          </Link>
        </Button>
      </div>
    );
  }
  
  const getStatusBadge = () => {
    const variant = campaign.status === 'active' 
      ? 'default' 
      : campaign.status === 'draft' 
        ? 'outline' 
        : 'secondary';
    
    return (
      <Badge variant={variant}>
        {campaign.status}
      </Badge>
    );
  };
  
  const getExecutionStatusBadge = () => {
    const variant = 
      campaign.execution_status === 'in_progress' ? 'success' :
      campaign.execution_status === 'paused' ? 'warning' :
      campaign.execution_status === 'completed' ? 'secondary' : 
      'outline';
    
    return (
      <Badge variant={variant}>
        {campaign.execution_status === 'in_progress' ? 'Running' :
         campaign.execution_status === 'pending' ? 'Not Started' :
         campaign.execution_status || 'Unknown'}
      </Badge>
    );
  };
  
  const handleStartOrPause = async () => {
    if (campaign.execution_status === 'in_progress') {
      await pauseCampaignExecution(campaign.id);
    } else {
      await startCampaignExecution(campaign.id);
    }
    refetch();
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/campaigns" className="hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            {getStatusBadge()}
            {getExecutionStatusBadge()}
          </div>
          <p className="text-muted-foreground max-w-3xl">{campaign.description}</p>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Created: {new Date(campaign.created_at).toLocaleDateString()}
            </div>
            {campaign.execution_start_date && (
              <div>
                Started: {new Date(campaign.execution_start_date).toLocaleDateString()}
              </div>
            )}
            {campaign.strategy_id && (
              <div>
                From Strategy: <Link to={`/strategy/${campaign.strategy_id}`} className="text-blue-600 hover:underline">View</Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={campaign.execution_status === 'in_progress' ? "outline" : "default"}
            onClick={handleStartOrPause}
          >
            {campaign.execution_status === 'in_progress' ? 'Pause' : 'Start'} Campaign
          </Button>
        </div>
      </div>
      
      {/* Campaign Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Campaign Scripts</CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.scripts && Object.keys(campaign.scripts).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(campaign.scripts).map(([channel, content]) => (
                    <CampaignScriptPanel 
                      key={channel} 
                      channel={channel} 
                      content={String(content)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-muted/30 p-4 rounded-md text-center">
                  <p className="text-muted-foreground">No scripts available for this campaign</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <CampaignExecutionTracker 
            campaign={campaign} 
            onUpdate={refetch}
          />
          
          {agentProfile?.agent_name && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">AI Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {agentProfile.agent_name.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium">{agentProfile.agent_name}</p>
                    <p className="text-sm text-muted-foreground">{agentProfile.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
