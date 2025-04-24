import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  Loader2, 
  List, 
  LayoutGrid, 
  Search, 
  Rocket, 
  TrendingUp, 
  RefreshCw, 
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Campaign } from "@/types/campaign";
import { cn } from "@/lib/utils";

export default function CampaignsPage() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!tenant?.id
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = searchTerm === "" || 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const draftCampaigns = campaigns.filter(c => c.status === "draft").length;
  const completedCampaigns = campaigns.filter(c => c.status === "completed").length;

  const handleViewCampaign = (id: string) => {
    navigate(`/campaigns/${id}`);
  };

  const getCampaignProgress = (campaign: Campaign) => {
    if (campaign.execution_status === 'completed') return 100;
    if (campaign.execution_status === 'pending' || !campaign.execution_start_date) return 0;
    
    const metrics = campaign.execution_metrics || {};
    if (!metrics.views) return 5;
    if (!metrics.clicks) return 25;
    if (!metrics.conversions) return 60;
    return 90;
  };

  const getCampaignStatusColor = (status: string) => {
    switch(status) {
      case 'active': return "bg-green-500";
      case 'draft': return "bg-amber-500";
      case 'paused': return "bg-blue-500";
      case 'completed': return "bg-slate-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className={cn("container mx-auto p-6")}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your marketing campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/campaigns/create')}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{totalCampaigns}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-3xl font-bold">{activeCampaigns}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-3xl font-bold">{draftCampaigns}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <PlusCircle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{completedCampaigns}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 md:items-center md:justify-between">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startAdornment={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        
        <div className="flex gap-3 items-center">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredCampaigns.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Badge variant="outline" className={cn(
                      "py-1",
                      campaign.status === "active" ? "border-green-500 text-green-600" : 
                      campaign.status === "draft" ? "border-amber-500 text-amber-600" :
                      campaign.status === "paused" ? "border-blue-500 text-blue-600" :
                      "border-slate-500 text-slate-600"
                    )}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{campaign.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {campaign.description || "No description available"}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{getCampaignProgress(campaign)}%</span>
                      </div>
                      <Progress 
                        value={getCampaignProgress(campaign)} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/50 p-1 rounded-md">
                        <div className="text-xs text-muted-foreground">Views</div>
                        <div className="font-medium">
                          {campaign.execution_metrics?.views || 0}
                        </div>
                      </div>
                      <div className="bg-muted/50 p-1 rounded-md">
                        <div className="text-xs text-muted-foreground">Clicks</div>
                        <div className="font-medium">
                          {campaign.execution_metrics?.clicks || 0}
                        </div>
                      </div>
                      <div className="bg-muted/50 p-1 rounded-md">
                        <div className="text-xs text-muted-foreground">Conv.</div>
                        <div className="font-medium">
                          {campaign.execution_metrics?.conversions || 0}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(campaign.created_at || '').toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleViewCampaign(campaign.id)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCampaigns.map((campaign) => (
              <div 
                key={campaign.id}
                className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => handleViewCampaign(campaign.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-8 w-1 rounded ${getCampaignStatusColor(campaign.status)}`}></div>
                    <div>
                      <h3 className="font-medium">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {campaign.description || "No description available"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Views</div>
                        <div className="font-medium">
                          {campaign.execution_metrics?.views || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Clicks</div>
                        <div className="font-medium">
                          {campaign.execution_metrics?.clicks || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Conv.</div>
                        <div className="font-medium">
                          {campaign.execution_metrics?.conversions || 0}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-accent/50">
          <Rocket className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-xl font-medium">No campaigns found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filters" 
              : "Create your first campaign to get started"}
          </p>
          <Button onClick={() => navigate('/campaigns/create')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Campaign
          </Button>
        </div>
      )}
    </div>
  );
}
