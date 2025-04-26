import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

interface KpiData {
  date: string;
  value: number;
}

interface CampaignData {
  id: string;
  name: string;
}

interface FilterState {
  dateRange: DateRange | undefined;
  campaigns: string[];
  metrics: string[];
}

const initialFilters: FilterState = {
  dateRange: undefined,
  campaigns: [],
  metrics: [],
};

export default function KpiDashboard() {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { logActivity } = useSystemLogs();
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>(initialFilters);
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);
  const [availableCampaigns, setAvailableCampaigns] = useState<CampaignData[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const returnPath = window.history.state?.returnPath || "/campaigns";

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch available campaigns
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id, name')
          .eq('tenant_id', tenant?.id);
          
        if (campaignsError) throw campaignsError;
        setAvailableCampaigns(campaignsData || []);
        
        // Fetch available metrics (example: page_views, clicks, conversions)
        const { data: metricsData, error: metricsError } = await supabase
          .from('kpi_metrics')
          .select('kpi_name')
          .eq('tenant_id', tenant?.id);
          
        if (metricsError) throw metricsError;
        setAvailableMetrics(metricsData?.map(m => m.kpi_name) || []);
        
        // Apply initial filters if campaignId is present
        if (campaignId) {
          setSelectedFilters(prev => ({
            ...prev,
            campaigns: [campaignId]
          }));
        }
        
        // Log KPI dashboard view
        logActivity({
          event_type: "KPI_DASHBOARD_VIEW",
          message: "KPI Dashboard viewed",
          meta: { filters: selectedFilters }
        }).catch(error => {
          console.error("Failed to log KPI dashboard view:", error);
        });
        
      } catch (err: any) {
        console.error("Error fetching initial data:", err);
        setError(err.message || "Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };
    
    if (tenant?.id && user?.id) {
      fetchInitialData();
    }
  }, [tenant?.id, user?.id, campaignId]);

  useEffect(() => {
    const fetchKpiData = async () => {
      setIsFiltering(true);
      setError(null);
      
      try {
        let query = supabase
          .from('kpi_metrics')
          .select('*')
          .eq('tenant_id', tenant?.id);
          
        // Apply date range filter
        if (selectedFilters.dateRange?.from && selectedFilters.dateRange?.to) {
          query = query.gte('date', format(selectedFilters.dateRange.from, 'yyyy-MM-dd'));
          query = query.lte('date', format(selectedFilters.dateRange.to, 'yyyy-MM-dd'));
        }
        
        // Apply campaign filter
        if (selectedFilters.campaigns.length > 0) {
          query = query.in('campaign_id', selectedFilters.campaigns);
        }
        
        // Apply metrics filter
        if (selectedFilters.metrics.length > 0) {
          query = query.in('kpi_name', selectedFilters.metrics);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        // Transform data for recharts
        const transformedData = data?.map(item => ({
          date: item.date,
          value: item.value,
          name: item.kpi_name
        })) || [];
        
        setKpiData(transformedData);
        
        // Fetch campaigns based on selected filters
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id, name')
          .eq('tenant_id', tenant?.id)
          .in('id', selectedFilters.campaigns);
          
        if (campaignsError) throw campaignsError;
        setCampaigns(campaignsData || []);
        
      } catch (err: any) {
        console.error("Error fetching KPI data:", err);
        setError(err.message || "Failed to load KPI data");
      } finally {
        setIsFiltering(false);
      }
    };
    
    if (tenant?.id) {
      fetchKpiData();
    }
  }, [tenant?.id, selectedFilters]);

  const handleFilterChange = (filterType: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleCampaignSelect = (campaignId: string) => {
    setSelectedFilters(prev => {
      const isSelected = prev.campaigns.includes(campaignId);
      return {
        ...prev,
        campaigns: isSelected
          ? prev.campaigns.filter(id => id !== campaignId)
          : [...prev.campaigns, campaignId]
      };
    });
  };

  const handleMetricSelect = (metric: string) => {
    setSelectedFilters(prev => {
      const isSelected = prev.metrics.includes(metric);
      return {
        ...prev,
        metrics: isSelected
          ? prev.metrics.filter(m => m !== metric)
          : [...prev.metrics, metric]
      };
    });
  };

  const groupedData = kpiData.reduce((acc, item) => {
    const { date, value, name } = item;
    if (!acc[date]) {
      acc[date] = {};
    }
    acc[date][name] = value;
    return acc;
  }, {});

  const chartData = Object.entries(groupedData).map(([date, values]) => ({
    date,
    ...values,
  }));

  const metricColors = {
    page_views: '#8884d8',
    clicks: '#82ca9d',
    conversions: '#ffc658',
  };

  if (loading) {
    return <LoadingOverlay show={true} label="Loading dashboard..." />;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate(returnPath)}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">KPI Dashboard</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Customize your KPI view</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !selectedFilters.dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedFilters.dateRange?.from ? (
                      selectedFilters.dateRange.to ? (
                        <>
                          {format(selectedFilters.dateRange.from, "MMM dd, yyyy")} -{" "}
                          {format(selectedFilters.dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(selectedFilters.dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={selectedFilters.dateRange?.from}
                    selected={selectedFilters.dateRange}
                    onSelect={(dateRange) => handleFilterChange('dateRange', dateRange)}
                    numberOfMonths={2}
                    pagedNavigation
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Campaigns</Label>
              <Select onValueChange={(value) => handleCampaignSelect(value)}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  {availableCampaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Metrics</Label>
              <Select onValueChange={(value) => handleMetricSelect(value)}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a metric" />
                </SelectTrigger>
                <SelectContent>
                  {availableMetrics.map((metric) => (
                    <SelectItem key={metric} value={metric}>
                      {metric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-red-500">{error}</div>
      )}

      {isFiltering ? (
        <LoadingOverlay show={true} label="Filtering data..." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>KPI Chart</CardTitle>
            <CardDescription>
              Visual representation of key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {availableMetrics.map(metric => (
                    <Bar key={metric} dataKey={metric} fill={metricColors[metric] || '#8884d8'} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">No data available for the selected filters.</div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Selected Campaigns</CardTitle>
          <CardDescription>
            List of campaigns included in this dashboard view
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length > 0 ? (
            <ul className="list-disc list-inside">
              {campaigns.map(campaign => (
                <li key={campaign.id}>{campaign.name}</li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4">No campaigns selected.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
