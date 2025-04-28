
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client"; 
import { useAuth } from "@/hooks/useAuth";
import { Strategy } from "@/types/strategy";
import { AlertCircle, Check, ArrowLeft, Sparkles } from "lucide-react";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { Checkbox } from "@/components/ui/checkbox";
import { ToastService } from "@/services/ToastService";

export default function CampaignCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { logActivity } = useSystemLogs();
  
  const initialStrategyId = location.state?.strategyId;
  const returnPath = location.state?.returnPath || "/campaigns";
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [strategyId, setStrategyId] = useState<string | null>(initialStrategyId || null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [channels, setChannels] = useState<string[]>([]);
  
  const availableChannels = [
    { id: "email", label: "Email Marketing" },
    { id: "social", label: "Social Media" },
    { id: "content", label: "Content Marketing" },
    { id: "ads", label: "Paid Advertising" },
    { id: "seo", label: "SEO" },
    { id: "whatsapp", label: "WhatsApp" }
  ];

  useEffect(() => {
    if (!tenant?.id) return;
    
    const fetchStrategies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('strategies')
          .select('*')
          .eq('tenant_id', tenant.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setStrategies((data || []).map(item => ({
          ...item,
          metrics_target: item.metrics_target || {}, 
          tags: item.tags || [],
          goals: item.goals || [],
          channels: item.channels || [],
          kpis: item.kpis || []
        } as Strategy)));
        
        if (initialStrategyId) {
          const selectedStrategy = data?.find(s => s.id === initialStrategyId) || null;
          
          if (selectedStrategy) {
            setSelectedStrategy({
              ...selectedStrategy,
              metrics_target: selectedStrategy.metrics_target || {},
              tags: selectedStrategy.tags || [],
              goals: selectedStrategy.goals || [],
              channels: selectedStrategy.channels || [],
              kpis: selectedStrategy.kpis || []
            } as Strategy);
            
            setName(`${selectedStrategy.title} Campaign`);
            setDescription(`Campaign based on: ${selectedStrategy.title}`);
          }
        }
      } catch (err: any) {
        console.error("Error fetching strategies:", err);
        setError(err.message || "Failed to load strategies");
        ToastService.error({
          title: "Error loading strategies", 
          description: err.message || "Please try again"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStrategies();
  }, [tenant?.id, initialStrategyId]);

  const handleStrategySelect = (id: string) => {
    setStrategyId(id);
    const selected = strategies.find(s => s.id === id) || null;
    setSelectedStrategy(selected);
    
    if (selected) {
      setName(`${selected.title} Campaign`);
      setDescription(`Campaign based on: ${selected.title}`);
    }
  };

  const toggleChannel = (channelId: string) => {
    setChannels(current => 
      current.includes(channelId)
        ? current.filter(c => c !== channelId)
        : [...current, channelId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenant?.id) {
      ToastService.error({ 
        title: "Missing workspace", 
        description: "Please select a workspace first" 
      });
      return;
    }
    
    if (!name.trim()) {
      ToastService.error({
        title: "Campaign name required", 
        description: "Please provide a name for your campaign"
      });
      return;
    }
    
    if (channels.length === 0) {
      ToastService.error({
        title: "Please select channels", 
        description: "Select at least one channel for your campaign"
      });
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          tenant_id: tenant.id,
          name,
          description,
          strategy_id: strategyId,
          status: 'draft',
          execution_status: 'pending',
          scripts: { channels: channels.reduce((obj, ch) => ({ ...obj, [ch]: { content: "" } }), {}) }
        })
        .select()
        .single();
      
      if (campaignError) throw campaignError;
      
      await logActivity({
        event_type: "CAMPAIGN_CREATED",
        message: `Campaign "${name}" created successfully`,
        meta: {
          campaign_id: campaign.id,
          strategy_id: strategyId,
          channels
        }
      });
      
      ToastService.success({
        title: "Campaign created",
        description: "Your campaign has been created successfully"
      });
      
      setTimeout(() => {
        navigate(`/campaigns/${campaign.id}`, { 
          replace: true,
          state: { 
            newlyCreated: true,
            returnPath
          }
        });
      }, 500);
      
    } catch (err: any) {
      console.error("Error creating campaign:", err);
      setError(err.message || "Failed to create campaign");
      ToastService.error({
        title: "Campaign creation failed",
        description: err.message || "Please try again"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingOverlay show={true} label="Loading..." />;
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-8">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(returnPath)}
          className="flex items-center gap-1 mr-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
          <p className="text-muted-foreground">Set up a new marketing campaign</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          variant="outline"
          onClick={() => navigate('/campaigns/wizard')}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Use AI Wizard
        </Button>
      </div>
      
      <LoadingOverlay show={submitting} label="Creating campaign..." />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Define your campaign's basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter campaign name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campaign-desc">Description</Label>
              <Textarea
                id="campaign-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe your campaign's objectives"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="strategy-select">Based on Strategy</Label>
              {strategies.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No approved strategies</AlertTitle>
                  <AlertDescription>
                    You need to create and approve a strategy before creating campaigns.
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/strategy")}
                      className="p-0 h-auto mt-1"
                    >
                      Go to Strategies
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <Select
                  value={strategyId || undefined}
                  onValueChange={handleStrategySelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-3">
              <Label>Marketing Channels</Label>
              <div className="grid grid-cols-2 gap-3">
                {availableChannels.map((channel) => (
                  <div key={channel.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`channel-${channel.id}`}
                      checked={channels.includes(channel.id)}
                      onCheckedChange={() => toggleChannel(channel.id)}
                    />
                    <Label
                      htmlFor={`channel-${channel.id}`}
                      className="cursor-pointer"
                    >
                      {channel.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedStrategy && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="strategy-details">
                  <AccordionTrigger>Strategy Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 p-4 bg-muted/50 rounded-md">
                      <div>
                        <h4 className="font-medium">Strategy</h4>
                        <p className="text-sm text-muted-foreground">{selectedStrategy.title}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedStrategy.description || "No description available"}
                        </p>
                      </div>
                      
                      {selectedStrategy.tags && selectedStrategy.tags.length > 0 && (
                        <div>
                          <h4 className="font-medium">Tags</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedStrategy.tags.map((tag, i) => (
                              <span 
                                key={i} 
                                className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(returnPath)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || channels.length === 0 || submitting}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" /> Create Campaign
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
