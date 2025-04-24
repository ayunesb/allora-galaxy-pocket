import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ResponsiveCardGrid } from "@/components/ui/responsive-card-grid";
import { useIsMobile } from "@/hooks/use-mobile";
import { CronJobStatus } from "../system-health/CronJobStatus";
import { ApprovalStatsTable } from "../../app/admin/ai-decisions/components/ApprovalStatsTable";
import { PluginAnalytics } from "../../app/admin/plugins/PluginAnalytics";
import { useKpiMetrics } from "@/hooks/useKpiMetrics";
import { ArrowRight, BarChart2, Cpu, Database, Shield, Users } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: tenantCount, isLoading: isLoadingTenants } = useQuery({
    queryKey: ['tenant-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tenant_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: userCount, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['user-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tenant_user_roles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });
  
  const { data: kpiMetrics, isLoading: isLoadingKpis } = useKpiMetrics();
  
  const { data: cronJobs, isLoading: isLoadingCron } = useQuery({
    queryKey: ['cron-jobs-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cron_job_logs')
        .select('status, count')
        .limit(100);
      
      if (error) throw error;
      
      const statusCounts = {
        success: 0,
        error: 0,
        running: 0,
        total: 0
      };
      
      data.forEach(item => {
        if (item.status in statusCounts) {
          statusCounts[item.status] += item.count || 1;
        }
        statusCounts.total += item.count || 1;
      });
      
      return statusCounts;
    }
  });

  const isLoading = isLoadingTenants || isLoadingUsers || isLoadingKpis || isLoadingCron;

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={() => navigate("/admin/system-health")}
          >
            <Cpu className="mr-1 h-4 w-4" />
            System Health
          </Button>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={() => navigate("/admin/security-audit")}
          >
            <Shield className="mr-1 h-4 w-4" />
            Security Audit
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-[500px] md:w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
            <TabsTrigger value="ai">AI Performance</TabsTrigger>
            <TabsTrigger value="plugins">Plugins</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <ResponsiveCardGrid columns={{ default: 1, sm: 2, lg: 4 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tenantCount || 0}</div>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs"
                    onClick={() => navigate("/admin/tenants")}
                  >
                    View all workspaces <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userCount || 0}</div>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs"
                    onClick={() => navigate("/admin/users")}
                  >
                    Manage users <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">KPI Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiMetrics?.length || 0}</div>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs"
                    onClick={() => navigate("/insights/kpis")}
                  >
                    View metrics <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingCron ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <div className="flex items-center">
                      <div className="text-2xl font-bold">
                        {Math.round(
                          ((cronJobs?.success || 0) / Math.max((cronJobs?.total || 1), 1)) * 100
                        )}%
                      </div>
                      <div className="ml-2 text-xs text-muted-foreground">
                        Success Rate
                      </div>
                    </div>
                  )}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs"
                    onClick={() => setActiveTab("health")}
                  >
                    View system status <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </ResponsiveCardGrid>

            <ResponsiveCardGrid columns={{ default: 1, lg: 2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administration tasks</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => navigate("/admin/invite")}>
                    <Users className="mr-2 h-4 w-4" />
                    Invite Users
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/admin/security-audit")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Security Check
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/admin/analytics")}>
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/admin/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activations</CardTitle>
                  <CardDescription>New workspaces and plugins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2 border rounded-md">
                      <div>
                        <div className="font-medium">Acme Corp</div>
                        <div className="text-sm text-muted-foreground">New workspace activated</div>
                      </div>
                      <div className="text-sm text-muted-foreground">2 hours ago</div>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded-md">
                      <div>
                        <div className="font-medium">HubSpot Plugin</div>
                        <div className="text-sm text-muted-foreground">Installed by TechStart Inc.</div>
                      </div>
                      <div className="text-sm text-muted-foreground">5 hours ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ResponsiveCardGrid>
          </TabsContent>
          
          <TabsContent value="health">
            <Card>
              <CardHeader>
                <CardTitle>System Health Monitor</CardTitle>
                <CardDescription>Real-time status of system components</CardDescription>
              </CardHeader>
              <CardContent>
                <CronJobStatus />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI Decision Analytics</CardTitle>
                <CardDescription>Performance metrics for AI decision systems</CardDescription>
              </CardHeader>
              <CardContent>
                <ApprovalStatsTable />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="ml-auto" onClick={() => navigate("/admin/ai-decisions")}>
                  View Detailed Analytics
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="plugins">
            <Card>
              <CardHeader>
                <CardTitle>Plugin Usage Analytics</CardTitle>
                <CardDescription>Plugin adoption and performance data</CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <PluginAnalytics />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="ml-auto" onClick={() => navigate("/admin/plugins")}>
                  Manage Plugins
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>User accounts and access control</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Layers className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">User Analytics Dashboard</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    View detailed user engagement metrics and manage accounts
                  </p>
                  <Button className="mt-4" onClick={() => navigate("/admin/users")}>
                    Go to User Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
