
import { useState, useEffect } from "react";
import SwipeCard from "./SwipeCard";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Strategy } from "@/types/strategy";
import { toast } from "@/components/ui/sonner";

type ApprovalItem = Strategy | Campaign | PricingDecision | HireDecision;

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'campaign';
  budget?: number;
  status: string;
}

interface PricingDecision {
  id: string;
  title: string;
  description: string;
  type: 'pricing';
  currentPrice?: number;
  suggestedPrice?: number;
  status: string;
}

interface HireDecision {
  id: string;
  title: string;
  description: string;
  type: 'hire';
  role: string;
  salary_range?: string;
  status: string;
}

const PocketSwipe = () => {
  const [activeTab, setActiveTab] = useState("strategies");
  const [index, setIndex] = useState(0);
  const { tenant } = useTenant();

  const { data: strategies = [], isLoading: isStrategiesLoading } = useQuery({
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
      return data.map(strategy => ({ ...strategy, type: 'strategy' }));
    },
    enabled: !!tenant?.id && activeTab === 'strategies'
  });

  const { data: campaigns = [], isLoading: isCampaignsLoading } = useQuery({
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
      return data.map(campaign => ({ ...campaign, type: 'campaign' }));
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
  const isLoading = isStrategiesLoading || isCampaignsLoading;

  const approve = async () => {
    if (!tenant?.id || index >= items.length) return;
    
    const item = items[index];
    try {
      let table = '';
      let statusField = 'status';
      
      switch(item.type) {
        case 'strategy':
          table = 'strategies';
          break;
        case 'campaign':
          table = 'campaigns';
          break;
        case 'pricing':
          table = 'pricing_decisions';
          break;
        case 'hire':
          table = 'hire_decisions';
          break;
      }
      
      if (!table) return;
      
      const { error } = await supabase
        .from(table)
        .update({ [statusField]: 'approved' })
        .eq('id', item.id);
        
      if (error) throw error;
      
      // Log the approval
      await supabase.from("agent_memory").insert({
        tenant_id: tenant.id,
        agent_name: "CEO",
        context: `User approved ${item.type}: ${item.title || item.name}`,
        type: "feedback",
        is_user_submitted: true
      });
      
      toast.success(`${item.type} approved!`);
      setIndex(i => i + 1);
    } catch (error) {
      console.error("Error approving item:", error);
      toast.error("Failed to approve");
    }
  };

  const decline = async () => {
    if (!tenant?.id || index >= items.length) return;
    
    const item = items[index];
    try {
      let table = '';
      let statusField = 'status';
      
      switch(item.type) {
        case 'strategy':
          table = 'strategies';
          break;
        case 'campaign':
          table = 'campaigns';
          break;
        case 'pricing':
          table = 'pricing_decisions';
          break;
        case 'hire':
          table = 'hire_decisions';
          break;
      }
      
      if (!table) return;
      
      const { error } = await supabase
        .from(table)
        .update({ [statusField]: 'rejected' })
        .eq('id', item.id);
        
      if (error) throw error;
      
      // Log the rejection
      await supabase.from("agent_memory").insert({
        tenant_id: tenant.id,
        agent_name: "CEO",
        context: `User declined ${item.type}: ${item.title || item.name}`,
        type: "feedback",
        is_user_submitted: true
      });
      
      toast.success(`${item.type} declined`);
      setIndex(i => i + 1);
    } catch (error) {
      console.error("Error declining item:", error);
      toast.error("Failed to decline");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-10">Loading decisions...</div>;
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

    const current = items[index];
    return (
      <>
        <SwipeCard 
          title={current.title || current.name} 
          summary={current.description}
          type={current.type}
          metadata={current} 
        />
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={decline} 
            variant="destructive"
            className="w-full"
          >
            <X className="mr-2" />
            Decline
          </Button>
          <Button 
            onClick={approve} 
            className="w-full bg-green-600 hover:bg-green-700"
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
      
      {items.length > 0 && index < items.length && (
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
