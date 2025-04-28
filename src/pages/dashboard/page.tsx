import React from 'react';
import { KpiOverview } from "@/components/dashboard/KpiOverview";
import { KPISection } from "@/app/dashboard/components/KPISection";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function DashboardPage() {
  const { tenant } = useTenant();
  const { logs, getRecentLogs } = useSystemLogs();
  
  // Get company name
  const { data: companyProfile } = useQuery({
    queryKey: ['company-profile', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;
      
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('tenant_id', tenant.id)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!tenant?.id,
  });
  
  // Get recent strategies
  const { data: strategies } = useQuery({
    queryKey: ['recent-strategies', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });
  
  // Fetch recent system logs when component mounts
  React.useEffect(() => {
    if (getRecentLogs) {
      getRecentLogs();
    }
  }, [getRecentLogs]);
  
  const recentLogs = logs?.slice(0, 5) || [];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to {companyProfile?.name || 'your'} Allora OS dashboard
          </p>
        </div>
        <Link to="/strategy">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Strategy
          </Button>
        </Link>
      </div>

      <KpiOverview />
      <KPISection />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Recent Strategies */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Strategies</CardTitle>
              <Link to="/strategy">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <CardDescription>Your latest business strategies</CardDescription>
          </CardHeader>
          <CardContent>
            {strategies && strategies.length > 0 ? (
              <div className="space-y-4">
                {strategies.map(strategy => (
                  <div key={strategy.id} className="border rounded-md p-4">
                    <h3 className="font-medium">{strategy.title || 'Untitled Strategy'}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {strategy.description || 'No description available'}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(strategy.created_at).toLocaleDateString()}
                      </span>
                      <Link to={`/strategy/${strategy.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No strategies created yet</p>
                <Link to="/strategy">
                  <Button>Create Your First Strategy</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        <NotificationCenter />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Access common functions and tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/campaigns/center" className="block">
              <div className="border rounded-md p-4 h-full hover:border-primary hover:shadow-sm transition-all">
                <h3 className="font-medium">Campaigns</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage your marketing campaigns</p>
              </div>
            </Link>
            <Link to="/launch" className="block">
              <div className="border rounded-md p-4 h-full hover:border-primary hover:shadow-sm transition-all">
                <h3 className="font-medium">Launch</h3>
                <p className="text-sm text-muted-foreground mt-1">Execute your strategies</p>
              </div>
            </Link>
            <Link to="/insights/kpis" className="block">
              <div className="border rounded-md p-4 h-full hover:border-primary hover:shadow-sm transition-all">
                <h3 className="font-medium">Insights</h3>
                <p className="text-sm text-muted-foreground mt-1">View performance metrics</p>
              </div>
            </Link>
            <Link to="/agents" className="block">
              <div className="border rounded-md p-4 h-full hover:border-primary hover:shadow-sm transition-all">
                <h3 className="font-medium">Agents</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage AI assistants</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
