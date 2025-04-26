
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, Calendar, Settings, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const DashboardPage: React.FC = () => {
  const { data: strategies = [] } = useQuery({
    queryKey: ['recent-strategies'],
    queryFn: async () => {
      const { data } = await supabase
        .from('strategies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      return data || [];
    }
  });

  const { data: kpiMetrics = [] } = useQuery({
    queryKey: ['kpi-metrics'],
    queryFn: async () => {
      const { data } = await supabase
        .from('kpi_metrics')
        .select('*')
        .limit(4);
      return data || [];
    }
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" /> Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpiMetrics.length > 0 ? (
          kpiMetrics.map((metric: any) => (
            <Card key={metric.id} className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.metric}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-500 font-medium">↑ 12%</span> vs last month
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {['Conversion Rate', 'Active Campaigns', 'ROI', 'Engagement'][i]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {['4.6%', '8', '$2,410', '68%'][i]}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={i % 2 === 0 ? "text-emerald-500 font-medium" : "text-rose-500 font-medium"}>
                    {i % 2 === 0 ? '↑ 12%' : '↓ 8%'}
                  </span> vs last month
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Strategies */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Recent Strategies</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/strategy">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {strategies.length > 0 ? (
            <div className="space-y-4">
              {strategies.map((strategy: any) => (
                <div key={strategy.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{strategy.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {strategy.status} • {new Date(strategy.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Link to={`/strategy/${strategy.id}`}>
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center border rounded-md border-dashed">
              <p className="text-muted-foreground mb-4">No recent strategies</p>
              <Link to="/strategy">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Strategy
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Calendar */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Upcoming Campaigns</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/campaigns">View Calendar</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/40 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                <span className="font-medium">Content Marketing Push</span>
              </div>
              <div className="text-sm text-muted-foreground">April 28 - May 15, 2025</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                <span className="font-medium">Product Launch</span>
              </div>
              <div className="text-sm text-muted-foreground">May 10, 2025</div>
            </div>
            <div className="bg-muted/40 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                <span className="font-medium">Quarterly Review</span>
              </div>
              <div className="text-sm text-muted-foreground">June 30, 2025</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button variant="outline" className="w-full" asChild>
            <Link to="/campaigns/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              Schedule Campaign
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Performance Overview</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/performance">
                <TrendingUp className="h-4 w-4 mr-2" />
                Details
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border border-dashed rounded-md">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Performance metrics will appear here</p>
              <Button variant="outline" size="sm" className="mt-3">Connect Analytics</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
