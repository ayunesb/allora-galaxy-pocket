import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";

interface AlertCardProps {
  id: string;
  kpi_name: string;
  insight: string;
  impact_level: string;
  suggested_action?: string;
  created_at: string;
  onForward: (id: string) => void;
  onApprove: (id: string) => void;
}

export function AlertCard({ 
  id,
  kpi_name,
  insight,
  impact_level,
  suggested_action,
  created_at,
  onForward,
  onApprove
}: AlertCardProps) {
  const getSeverityIcon = () => {
    switch (impact_level) {
      case 'critical':
        return <AlertOctagon className="h-5 w-5" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityColor = () => {
    switch (impact_level) {
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

  const hasRecoveryPlan = suggested_action?.startsWith('## Recovery Plan');

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
        {suggested_action && (
          <div className="bg-muted p-3 rounded-md">
            {hasRecoveryPlan ? (
              <ReactMarkdown 
                className="text-sm prose prose-sm dark:prose-invert max-w-none"
              >
                {suggested_action}
              </ReactMarkdown>
            ) : (
              <p className="text-sm text-muted-foreground">{suggested_action}</p>
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
