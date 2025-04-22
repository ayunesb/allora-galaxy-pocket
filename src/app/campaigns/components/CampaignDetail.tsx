
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/hooks/useTenant";
import { AgentInfoCard } from "./AgentInfoCard";
import type { Campaign } from "@/types/campaign";

interface CampaignDetailProps {
  id?: string;
}

export default function CampaignDetail({ id }: CampaignDetailProps) {
  const { tenant } = useTenant();

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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AgentInfoCard />
      <h1 className="text-2xl font-bold">{campaign.name}</h1>
      <p className="text-muted-foreground">{campaign.description}</p>
      
      {/* Display campaign details here */}
      <div className="grid gap-4">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Campaign Status</h3>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {campaign.status}
          </div>
        </div>
        
        {campaign.scripts && Object.keys(campaign.scripts).length > 0 ? (
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Campaign Scripts</h3>
            <div className="grid gap-3 mt-2">
              {Object.entries(campaign.scripts).map(([channel, script]) => (
                <div key={channel} className="bg-background p-3 rounded border">
                  <div className="font-medium text-sm mb-1 capitalize">{channel}</div>
                  <div className="text-sm text-muted-foreground">{String(script)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">No scripts available for this campaign</h3>
          </div>
        )}
      </div>
    </div>
  );
}
