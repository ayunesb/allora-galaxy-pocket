
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Campaign, CampaignStatus } from "@/types/campaign";
import CampaignCard from "./CampaignCard";
import CampaignRecap from "./CampaignRecap";
import { Loader2 } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CampaignPage() {
  // Only use allowed status values from type
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<"active" | "draft" | "paused" | "completed">("active");
  const { tenant } = useTenant();

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(campaign => {
        return {
          ...campaign,
          status: campaign.status as Campaign['status']
        };
      }) as Campaign[];
    },
    enabled: !!tenant?.id
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading campaigns: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Active Campaigns</h1>
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No campaigns found. Create a new campaign from the Strategy page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Active Campaigns</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {campaigns.map((c, i) => (
          <CampaignCard
            key={c.id}
            name={c.name}
            status={c.status}
            cta={() => setSelected(i)}
          />
        ))}
      </div>

      {selected !== null && campaigns[selected] && (
        <CampaignRecap
          name={campaigns[selected].name}
          description={campaigns[selected].description || ""}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Campaign Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button 
              variant={status === "active" ? "default" : "outline"}
              onClick={() => setStatus("active")}
            >
              Active
            </Button>
            <Button 
              variant={status === "draft" ? "default" : "outline"}
              onClick={() => setStatus("draft")}
            >
              Draft
            </Button>
            <Button 
              variant={status === "paused" ? "default" : "outline"}
              onClick={() => setStatus("paused")}
            >
              Paused
            </Button>
            <Button 
              variant={status === "completed" ? "default" : "outline"}
              onClick={() => setStatus("completed")}
            >
              Completed
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
