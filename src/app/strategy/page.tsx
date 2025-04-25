
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Plus } from "lucide-react";
import { ToastService } from "@/services/ToastService";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { StrategyCard } from "./components/StrategyCard";
import { EmptyStrategiesState } from "./components/EmptyStrategiesState";
import { useStrategies } from "./hooks/useStrategies";

export default function StrategyPage() {
  const location = useLocation();
  const {
    loading,
    error,
    strategies,
    setOnboardingProfile,
    handleCreateStrategy,
    handleStrategySelect
  } = useStrategies();

  useEffect(() => {
    const state = location.state as { fromOnboarding?: boolean; profile?: any } | null;
    
    if (state?.fromOnboarding && state?.profile) {
      setOnboardingProfile(state.profile);
      ToastService.info({
        title: "Ready to create your first strategy",
        description: "Let's grow your business with data-driven strategies"
      });
    }
  }, [location, setOnboardingProfile]);

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
            <EmptyStrategiesState onCreateStrategy={handleCreateStrategy} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {strategies
                .filter(s => s.status !== 'archived')
                .map(strategy => (
                  <StrategyCard
                    key={strategy.id}
                    strategy={strategy}
                    onClick={handleStrategySelect}
                  />
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-4">
          {strategies.filter(s => s.status === 'archived').length === 0 ? (
            <EmptyStrategiesState onCreateStrategy={handleCreateStrategy} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {strategies
                .filter(s => s.status === 'archived')
                .map(strategy => (
                  <StrategyCard
                    key={strategy.id}
                    strategy={strategy}
                    onClick={handleStrategySelect}
                  />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
