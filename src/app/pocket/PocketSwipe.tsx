
import { useState, useEffect } from "react";
import SwipeCard from "./SwipeCard";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Strategy } from "@/types/strategy";
import { Campaign } from "@/types/campaign";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { useCampaignApproval } from "@/hooks/useCampaignApproval";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";

// Define interfaces for the decision types
interface PricingDecision {
  id: string;
  title: string;
  description: string;
  type: 'pricing';
  currentPrice?: number;
  suggestedPrice?: number;
  status: string;
  tenant_id: string;
}

interface HireDecision {
  id: string;
  title: string;
  description: string;
  type: 'hire';
  role: string;
  salary_range?: string;
  status: string;
  tenant_id: string;
}

// Define a union type for all approval items
type ApprovalItem = (Strategy & { type: 'strategy' }) | 
                    (Campaign & { type: 'campaign' }) | 
                    PricingDecision | 
                    HireDecision;

const PocketSwipe = () => {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [index, setIndex] = useState(0);
  const { tenant } = useTenant();
  const { toast: uiToast } = useToast();
  const queryClient = useQueryClient();
  const { approveCampaign, declineCampaign, isProcessing } = useCampaignApproval();

  const { data: strategies = [], isLoading: isStrategiesLoading, error: strategiesError } = useQuery({
    queryKey: ['pending-strategies', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data.map(strategy => ({ ...strategy, type: 'strategy' } as Strategy & { type: 'strategy' }));
    },
    enabled: !!tenant?.id && activeTab === 'strategies'
  });

  const { data: campaigns = [], isLoading: isCampaignsLoading, error: campaignsError } = useQuery({
    queryKey: ['pending-campaigns', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data.map(campaign => ({ ...campaign, type: 'campaign' } as Campaign & { type: 'campaign' }));
    },
    enabled: !!tenant?.id && activeTab === 'campaigns'
  });

  // Reset index when changing tabs
  useEffect(() => {
    setIndex(0);
  }, [activeTab]);

  const getCurrentItems = () => {
    switch(activeTab) {
      case 'strategies':
        return strategies;
      case 'campaigns':
        return campaigns;
      default:
        return [];
    }
  };

  const items = getCurrentItems();
  const isLoading = isStrategiesLoading || isCampaignsLoading || isProcessing;
  const error = strategiesError || campaignsError;

  const approve = async () => {
    if (!tenant?.id || index >= items.length) return;
    
    const item = items[index] as ApprovalItem;
    try {
      let success = false;
      
      switch(item.type) {
        case 'strategy':
          // Update strategy status
          const { error: strategyError } = await supabase
            .from('strategies')
            .update({ 
              status: 'approved',
              approved_at: new Date().toISOString()
            })
            .eq('id', item.id)
            .eq('tenant_id', tenant.id);
            
          if (strategyError) throw strategyError;
          
          // Log the strategy approval
          await supabase.from("agent_memory").insert({
            tenant_id: tenant.id,
            agent_name: "CEO",
            context: `User approved strategy: ${(item as Strategy & { type: 'strategy' }).title || 'Untitled'}`,
            type: "feedback",
            is_user_submitted: true,
            summary: "Strategy approval",
            tags: ["strategy", "approval"]
          });
          
          success = true;
          break;
          
        case 'campaign':
          // Use the campaign approval hook for campaigns
          success = await approveCampaign(item.id);
          break;
          
        case 'pricing':
          // Handle pricing decision approval using type assertion for tables not in the schema
          const { error: pricingError } = await supabase
            .from('pricing_decisions' as any)
            .update({ status: 'approved' })
            .eq('id', item.id)
            .eq('tenant_id', tenant.id);
            
          if (pricingError) throw pricingError;
          success = true;
          break;
          
        case 'hire':
          // Handle hire decision approval using type assertion for tables not in the schema
          const { error: hireError } = await supabase
            .from('hire_decisions' as any)
            .update({ status: 'approved' })
            .eq('id', item.id)
            .eq('tenant_id', tenant.id);
            
          if (hireError) throw hireError;
          success = true;
          break;
      }
      
      if (success) {
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({ queryKey: [`pending-${item.type}s`] });
        queryClient.invalidateQueries({ queryKey: [item.type === 'strategy' ? 'strategies' : 'campaigns'] });
        
        toast.success(`${item.type} approved!`);
        // Move to the next item
        setIndex(i => i + 1);
      }
    } catch (error) {
      console.error(`Error approving ${items[index].type}:`, error);
      uiToast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Could not approve item",
        variant: "destructive"
      });
    }
  };

  const decline = async () => {
    if (!tenant?.id || index >= items.length) return;
    
    const item = items[index] as ApprovalItem;
    try {
      let success = false;
      
      switch(item.type) {
        case 'strategy':
          // Update strategy status
          const { error: strategyError } = await supabase
            .from('strategies')
            .update({ 
              status: 'rejected',
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id)
            .eq('tenant_id', tenant.id);
            
          if (strategyError) throw strategyError;
          
          // Log the strategy rejection
          await supabase.from("agent_memory").insert({
            tenant_id: tenant.id,
            agent_name: "CEO",
            context: `User declined strategy: ${(item as Strategy & { type: 'strategy' }).title || 'Untitled'}`,
            type: "feedback",
            is_user_submitted: true,
            summary: "Strategy rejection",
            tags: ["strategy", "rejection"]
          });
          
          success = true;
          break;
          
        case 'campaign':
          // Use the campaign decline hook for campaigns
          success = await declineCampaign(item.id);
          break;
          
        case 'pricing':
        case 'hire':
          // Handle other decision types using type assertion for tables not in schema
          const table = item.type === 'pricing' ? 'pricing_decisions' : 'hire_decisions';
          const { error: decisionError } = await supabase
            .from(table as any)
            .update({ status: 'rejected' })
            .eq('id', item.id)
            .eq('tenant_id', tenant.id);
            
          if (decisionError) throw decisionError;
          success = true;
          break;
      }
      
      if (success) {
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({ queryKey: [`pending-${item.type}s`] });
        
        toast.success(`${item.type} declined`);
        // Move to the next item
        setIndex(i => i + 1);
      }
    } catch (error) {
      console.error(`Error declining ${items[index].type}:`, error);
      uiToast({
        title: "Decline failed",
        description: error instanceof Error ? error.message : "Could not decline item",
        variant: "destructive"
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-10">
        <LoadingSpinner />
        <p className="mt-2">Processing decisions...</p>
      </div>;
    }
    
    if (error) {
      return <ErrorAlert 
        title="Error loading decisions" 
        description={error instanceof Error ? error.message : "Could not load decisions"} 
      />;
    }

    if (!items || items.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-lg font-medium mb-4">No pending decisions</p>
          <p className="text-muted-foreground mb-6">There are no pending {activeTab} to review</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setActiveTab(activeTab === 'strategies' ? 'campaigns' : 'strategies')}>
              Check {activeTab === 'strategies' ? 'Campaigns' : 'Strategies'}
            </Button>
          </div>
        </div>
      );
    }

    if (index >= items.length) {
      return (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">You're done! 🎉</h2>
          <p className="text-muted-foreground">You've reviewed all pending {activeTab}.</p>
          <Button onClick={() => setIndex(0)} variant="outline">Start Over</Button>
        </div>
      );
    }

    const current = items[index] as ApprovalItem;
    // Handle different item types for the title/name field access
    const itemTitle = current.type === 'strategy' ? 
      (current as Strategy & { type: 'strategy' }).title || 'Untitled Strategy' : 
      current.type === 'campaign' ? 
        (current as Campaign & { type: 'campaign' }).name || 'Untitled Campaign' :
        current.title || 'Untitled Decision';
        
    return (
      <>
        <SwipeCard 
          title={itemTitle}
          summary={current.description}
          type={current.type}
          metadata={current} 
        />
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={decline} 
            variant="destructive"
            className="w-full"
            disabled={isProcessing}
          >
            <X className="mr-2" />
            Decline
          </Button>
          <Button 
            onClick={approve} 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isProcessing}
          >
            <Check className="mr-2" />
            Approve
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="strategies" className="space-y-4 pt-4">
          {renderContent()}
        </TabsContent>
        
        <TabsContent value="campaigns" className="space-y-4 pt-4">
          {renderContent()}
        </TabsContent>
      </Tabs>
      
      {items.length > 0 && index < items.length && !isProcessing && (
        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-muted-foreground">
            {index + 1} of {items.length}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIndex(i => Math.max(0, i - 1))}
              disabled={index === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIndex(i => Math.min(items.length - 1, i + 1))}
              disabled={index === items.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PocketSwipe;
