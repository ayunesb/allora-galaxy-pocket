
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AlertCircle, Clock, ArrowRight } from "lucide-react";

interface AlertCardProps {
  title: string;
  description: string;
  impact: string;
  date: string;
  action?: string;
}

export function AlertCard({ title, description, impact, date, action }: AlertCardProps) {
  // Function to get the appropriate badge variant based on impact level
  const getBadgeVariant = (impact: string) => {
    switch(impact.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  // Format the date to be more readable
  const formattedDate = format(new Date(date), 'MMM d, yyyy');

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <Badge variant={getBadgeVariant(impact)}>
            {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground flex items-center">
            <Clock className="h-4 w-4 mr-2" /> {formattedDate}
          </p>
          
          <p className="text-sm">{description}</p>
          
          {action && (
            <div className="p-3 bg-muted rounded-md mt-3">
              <p className="text-sm font-medium flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                Suggested Action:
              </p>
              <p className="text-sm pl-6 mt-1">{action}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AlertCard;
