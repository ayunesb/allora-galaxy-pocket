import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { AlertOctagon, AlertTriangle, Info, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AlertCardProps {
  id: string;
  kpi_name: string;
  insight: string;
  impact_level: string;
  suggested_action?: string;
  recommended_action?: string;
  created_at: string;
  tenant_id?: string;
  onForward: (id: string) => void;
  onApprove: (id: string) => void;
}

export function AlertCard({ 
  id,
  kpi_name,
  insight,
  impact_level,
  suggested_action,
  recommended_action,
  created_at,
  tenant_id,
  onForward,
  onApprove
}: AlertCardProps) {
  const navigate = useNavigate();
  
  const getSeverityIcon = () => {
    switch (impact_level.toLowerCase()) {
      case 'critical':
        return <AlertOctagon className="h-5 w-5" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityColor = () => {
    switch (impact_level.toLowerCase()) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleGenerateCampaign = async (insight: { recommended_action?: string; tenant_id?: string; id: string }) => {
    if (!insight.recommended_action) {
      toast.error("No recovery plan available to generate a campaign.");
      return;
    }
    try {
      const response = await fetch('/functions/extract-campaign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          plan: insight.recommended_action, 
          tenant_id: insight.tenant_id,
          insight_id: insight.id 
        })
      });

      const { campaign_data } = await response.json();

      if (campaign_data) {
        navigate(`/campaigns/create?prefill=${encodeURIComponent(JSON.stringify({
          ...campaign_data,
          insight_id: insight.id
        }))}`);
      } else {
        toast.error("Failed to generate campaign data.");
      }
    } catch (error) {
      console.error('Error generating campaign:', error);
      toast.error('Failed to generate campaign. Please try again.');
    }
  };

  const hasRecoveryPlan = (recommended_action || suggested_action)?.startsWith('## Recovery Plan');

  const planText = recommended_action ?? suggested_action ?? null;

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{kpi_name}</CardTitle>
          <Badge variant={getSeverityColor()} className="flex items-center gap-1">
            {getSeverityIcon()}
            {impact_level}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{insight}</p>
        {planText && (
          <div className="bg-muted p-3 rounded-md">
            {hasRecoveryPlan ? (
              <div className="space-y-4">
                <ReactMarkdown className="text-sm prose prose-sm dark:prose-invert max-w-none">
                  {planText}
                </ReactMarkdown>
                <Button
                  variant="default"
                  onClick={() => handleGenerateCampaign({ 
                    recommended_action: planText, 
                    tenant_id,
                    id 
                  })}
                  className="w-fit"
                >
                  <Rocket className="mr-1 h-4 w-4" />
                  Create Campaign from Plan
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{planText}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            onForward(id);
            toast.success("Alert forwarded to AI agent");
          }}
        >
          Forward to Agent
        </Button>
        <Button 
          onClick={() => {
            onApprove(id);
            toast.success("Alert marked as resolved");
          }}
        >
          Approve
        </Button>
      </CardFooter>
    </Card>
  );
}
