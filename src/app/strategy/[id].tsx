
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import type { Strategy } from "@/types/strategy";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Loader2, ThumbsUp, ThumbsDown, RefreshCw, MessageSquare, ClipboardList, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function StrategyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logActivity } = useSystemLogs();
  const [note, setNote] = useState("");
  const [showRawFeedback, setShowRawFeedback] = useState(false);

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

  const { data: feedbackItems, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['strategy-feedback', id],
    queryFn: async () => {
      if (!tenant?.id || !id) return [];
      
      const { data, error } = await supabase
        .from('strategy_feedback')
        .select(`
          id,
          action,
          user_id,
          created_at,
          tenant_id
        `)
        .eq('tenant_id', tenant.id)
        .eq('strategy_title', strategy?.title || '')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id && !!strategy?.title
  });

  // Subscribe to real-time updates for feedback
  useEffect(() => {
    if (!tenant?.id || !strategy?.title) return;
    
    const channel = supabase
      .channel('strategy_feedback_changes')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public', 
          table: 'strategy_feedback',
          filter: `tenant_id=eq.${tenant.id}` 
        }, 
        (payload) => {
          // Invalidate the query to refetch data when changes occur
          queryClient.invalidateQueries({ queryKey: ['strategy-feedback', id] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant?.id, strategy?.title, id, queryClient]);

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
      queryClient.invalidateQueries({ queryKey: ['strategy-feedback', id] });
      
      toast({
        title: action === 'used' ? 'Strategy approved' : 'Strategy declined',
        description: action === 'used' ? 'The strategy has been approved' : 'The strategy has been declined'
      });
      
      // Log activity
      logActivity({
        event_type: action === 'used' ? 'strategy_approved' : 'strategy_declined',
        message: `${action === 'used' ? 'Approved' : 'Declined'} strategy: ${strategy?.title}`,
        meta: {
          strategy_id: id,
          action: action
        }
      });
    }
  });

  useEffect(() => {
    if (strategy && tenant?.id && user?.id) {
      logActivity({ 
        event_type: 'strategy_viewed',
        message: `Viewed strategy: ${strategy.title}`,
        meta: { strategy_id: id }
      });
    }
  }, [strategy, tenant?.id, user?.id, id]);

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
    
    logActivity({ 
      event_type: 'strategy_regenerated',
      message: `Requested regeneration of strategy: ${strategy.title}`,
      meta: { strategy_id: id }
    });
  };

  const handleAddNote = () => {
    if (!note.trim() || !tenant?.id || !user?.id || !strategy) return;
    
    // Save note as feedback
    supabase
      .from('strategy_feedback')
      .insert({
        tenant_id: tenant.id,
        user_id: user.id,
        strategy_title: strategy.title,
        action: 'note',
        note: note.trim()
      })
      .then(({ error }) => {
        if (error) {
          toast({
            title: "Failed to save note",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        queryClient.invalidateQueries({ queryKey: ['strategy-feedback', id] });
        
        toast({
          title: "Note added",
          description: "Your note has been saved"
        });
        
        logActivity({ 
          event_type: 'strategy_note_added',
          message: `Added note to strategy: ${strategy.title}`,
          meta: { strategy_id: id, note: note.trim() }
        });
        
        setNote("");
      });
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
              <TabsTrigger value="feedback" className="flex items-center gap-1">
                <ClipboardList className="h-4 w-4" /> Feedback
              </TabsTrigger>
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
            <TabsContent value="feedback" className="mt-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium">Feedback History</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-raw"
                    checked={showRawFeedback}
                    onCheckedChange={setShowRawFeedback}
                  />
                  <Label htmlFor="show-raw">Show raw feedback</Label>
                </div>
              </div>
              
              {isLoadingFeedback ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin h-5 w-5" />
                </div>
              ) : feedbackItems && feedbackItems.length > 0 ? (
                <div className="space-y-4">
                  {feedbackItems.map((item: any) => (
                    <div key={item.id} className="border rounded-lg p-3 bg-muted/20">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {item.action === 'used' && <ThumbsUp className="h-4 w-4 text-green-500 mr-2" />}
                          {item.action === 'dismissed' && <ThumbsDown className="h-4 w-4 text-red-500 mr-2" />}
                          {item.action === 'note' && <MessageSquare className="h-4 w-4 text-amber-500 mr-2" />}
                          <span className="font-medium">
                            {item.action === 'used' && 'Approved'}
                            {item.action === 'dismissed' && 'Declined'}
                            {item.action === 'note' && 'Note'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(item.created_at), 'PPp')}
                        </div>
                      </div>
                      
                      {item.action === 'note' && item.note && (
                        <div className="mt-2 pl-6 text-sm">
                          {item.note}
                        </div>
                      )}
                      
                      {showRawFeedback && (
                        <div className="mt-2 pt-2 border-t text-xs font-mono">
                          <pre className="whitespace-pre-wrap break-all">
                            {JSON.stringify({
                              user_id: item.user_id,
                              action: item.action,
                              created_at: item.created_at
                            }, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No feedback recorded for this strategy yet.
                </div>
              )}
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
