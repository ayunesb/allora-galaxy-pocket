
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Strategy } from "@/types/strategy";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Loader2, ThumbsUp, ThumbsDown, RefreshCw, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function StrategyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const { data: strategy, isLoading, error } = useQuery({
    queryKey: ['strategy', id],
    queryFn: async () => {
      if (!id) throw new Error("Strategy ID is required");
      
      const { data, error } = await supabase
        .from('vault_strategies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Strategy;
    },
    enabled: !!id
  });

  const { mutate: logActivity } = useMutation({
    mutationFn: async ({ action, details }: { action: string, details?: any }) => {
      if (!tenant?.id || !user?.id || !id) return;

      await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          event_type: 'strategy_activity',
          message: `Strategy ${action}`,
          meta: {
            strategy_id: id,
            ...details
          }
        });
    }
  });

  const { mutate: saveFeedback } = useMutation({
    mutationFn: async ({ action }: { action: 'used' | 'dismissed' }) => {
      if (!tenant?.id || !user?.id || !strategy) return;

      await supabase
        .from('strategy_feedback')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          strategy_title: strategy.title,
          action: action
        });

      return action;
    },
    onSuccess: (action) => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      toast({
        title: action === 'used' ? 'Strategy approved' : 'Strategy declined',
        description: action === 'used' ? 'The strategy has been approved' : 'The strategy has been declined'
      });
    }
  });

  useEffect(() => {
    if (strategy && tenant?.id && user?.id) {
      logActivity({ action: 'viewed' });
    }
  }, [strategy, tenant?.id, user?.id]);

  const handleApprove = () => {
    saveFeedback({ action: 'used' });
  };

  const handleDecline = () => {
    saveFeedback({ action: 'dismissed' });
  };

  const handleRegenerate = () => {
    if (!strategy) return;
    
    toast({
      title: "Regenerating strategy",
      description: "The AI is creating a new version of this strategy"
    });
    
    logActivity({ action: 'regenerated' });
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    
    logActivity({ 
      action: 'note_added', 
      details: { note }
    });
    
    toast({
      title: "Note added",
      description: "Your note has been saved"
    });
    
    setNote("");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error ? (error as Error).message : "Strategy not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate('/dashboard')}>Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate('/vault')}>Strategies</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem isCurrentPage>
          {strategy.title}
        </BreadcrumbItem>
      </Breadcrumb>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{strategy.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Created: {strategy.created_at && format(new Date(strategy.created_at), 'PPP')}
            {strategy.industry && ` • Industry: ${strategy.industry}`}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <p>{strategy.description}</p>
            </TabsContent>
            <TabsContent value="goals" className="mt-4">
              <p>{strategy.goal || "No specific goals defined for this strategy."}</p>
            </TabsContent>
            <TabsContent value="tasks" className="mt-4">
              <p>Task list will be displayed here.</p>
            </TabsContent>
            <TabsContent value="campaigns" className="mt-4">
              <p>Associated campaigns will be displayed here.</p>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <h3 className="font-medium mb-2">Add Note</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type your note here..."
                className="flex-1 border rounded p-2"
              />
              <Button 
                onClick={handleAddNote}
                size="sm"
                disabled={!note.trim()}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button onClick={handleApprove} variant="default">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button onClick={handleDecline} variant="outline">
              <ThumbsDown className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
          <Button onClick={handleRegenerate} variant="secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
