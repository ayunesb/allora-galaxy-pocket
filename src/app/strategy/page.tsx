
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingProfile } from "@/types/onboarding"; 
import { Strategy } from "@/types/strategy";
import { toast } from "sonner";
import { AlertCircle, Settings, Sparkles, Plus } from "lucide-react";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function StrategyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [onboardingProfile, setOnboardingProfile] = useState<OnboardingProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if coming from onboarding flow
  useEffect(() => {
    const state = location.state as { fromOnboarding?: boolean; profile?: OnboardingProfile } | null;
    
    if (state?.fromOnboarding && state?.profile) {
      setOnboardingProfile(state.profile);
      toast("Ready to create your first strategy", {
        description: "Let's grow your business with data-driven strategies"
      });
      
      // Log the transition to strategy page
      logActivity({
        event_type: "USER_JOURNEY",
        message: "User navigated from onboarding to strategy creation",
        meta: {
          from: "onboarding",
          to: "strategy",
          profile_data: state.profile
        }
      }).catch(err => console.error("Failed to log activity:", err));
    }
  }, [location]);

  // Fetch existing strategies
  useEffect(() => {
    async function fetchStrategies() {
      if (!tenant?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('strategies')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setStrategies(data || []);
      } catch (err: any) {
        console.error("Failed to fetch strategies:", err);
        setError("Failed to load strategies. Please refresh the page.");
        toast("Error loading strategies", {
          description: err.message || "Please try again",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchStrategies();
  }, [tenant?.id]);

  const handleCreateStrategy = () => {
    navigate("/strategy-gen/new", { 
      state: { 
        onboardingProfile,
        returnPath: "/strategy"
      }
    });
  };

  const handleStrategySelect = (strategy: Strategy) => {
    navigate(`/strategy/${strategy.id}`);
  };

  if (loading) {
    return <LoadingOverlay show={true} label="Loading strategies..." />;
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Growth Strategies</h1>
          <p className="text-muted-foreground">Create and manage your business growth strategies</p>
        </div>
        
        <Button onClick={handleCreateStrategy} className="flex gap-2 items-center">
          <Plus className="h-4 w-4" /> Create Strategy
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Strategies</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {strategies.length === 0 ? (
            <Card className="bg-muted/40">
              <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No strategies yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Create your first growth strategy to start boosting your business metrics
                </p>
                <Button onClick={handleCreateStrategy} className="flex gap-2 items-center">
                  <Plus className="h-4 w-4" /> Create First Strategy
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {strategies
                .filter(s => s.status !== 'archived')
                .map(strategy => (
                  <Card 
                    key={strategy.id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => handleStrategySelect(strategy)}
                  >
                    <CardHeader>
                      <CardTitle>{strategy.title}</CardTitle>
                      <CardDescription>
                        {strategy.status === 'approved' ? 'Active' : 'Pending'} • Created{' '}
                        {new Date(strategy.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {strategy.description || "No description available"}
                      </p>
                      
                      {strategy.tags && strategy.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-4">
                          {strategy.tags.map((tag, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-4">
          {strategies.filter(s => s.status === 'archived').length === 0 ? (
            <Card className="bg-muted/40">
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No archived strategies</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {strategies
                .filter(s => s.status === 'archived')
                .map(strategy => (
                  <Card 
                    key={strategy.id}
                    className="cursor-pointer hover:shadow-md transition-all opacity-70"
                    onClick={() => handleStrategySelect(strategy)}
                  >
                    <CardHeader>
                      <CardTitle>{strategy.title}</CardTitle>
                      <CardDescription>
                        Archived • Created{' '}
                        {new Date(strategy.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {strategy.description || "No description available"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
