import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { toast } = useToast();
  
  const { data: companyProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['company-profile', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;
      
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('tenant_id', tenant.id)
        .single();
        
      if (error) {
        console.error("Error fetching company profile:", error);
        if (error.code !== 'PGRST116') { // No rows found
          toast({
            title: "Error loading company data",
            description: "Please refresh and try again",
            variant: "destructive"
          });
        }
        return null;
      }
      
      return data;
    },
    enabled: !!tenant?.id,
    retry: 1
  });
  
  const { data: strategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ['strategies', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('vault_strategies')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching strategies:", error);
        toast({
          title: "Error loading strategies",
          description: "Please refresh and try again",
          variant: "destructive"
        });
        return [];
      }
      
      return data || [];
    },
    enabled: !!tenant?.id,
    retry: 1
  });

  const isLoading = authLoading || tenantLoading || profileLoading || strategiesLoading;
  
  // Check authentication
  if (!authLoading && !user) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Check if onboarding is complete
  const onboardingComplete = !!companyProfile;
  if (!isLoading && !onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin mr-2 h-6 w-6" />
          <span>Loading dashboard...</span>
        </div>
      ) : (
        <>
          {/* Welcome section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to Allora OS</h1>
            <p className="text-muted-foreground">
              {companyProfile?.name ? `${companyProfile.name}'s dashboard` : 'Your dashboard'}
            </p>
          </div>
          
          {/* Strategy section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Your Strategies</h2>
              <Link to="/vault">
                <Button variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Strategy
                </Button>
              </Link>
            </div>
            
            {strategies && strategies.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {strategies.map((strategy) => (
                  <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{strategy.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {strategy.description || 'No description available'}
                      </CardDescription>
                      <p className="text-xs mt-1 text-muted-foreground">
                        📈 Impact Score: {strategy.impact_score ?? "N/A"}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Created: {new Date(strategy.created_at).toLocaleDateString()}
                        </span>
                        <Link to={`/strategy/${strategy.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-center mb-4">No strategies found. Get started by creating your first strategy!</p>
                  <Link to="/strategy">
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create First Strategy
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>
          
          {/* Quick links */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Launch marketing campaigns across multiple channels.</p>
                  <Link to="/campaigns/center">
                    <Button variant="outline" className="w-full">Go to Campaigns</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Launch</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Push new strategies to your marketing channels.</p>
                  <Link to="/launch">
                    <Button variant="outline" className="w-full">Go to Launch</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Track KPIs and monitor performance metrics.</p>
                  <Link to="/insights/kpis">
                    <Button variant="outline" className="w-full">View Insights</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
