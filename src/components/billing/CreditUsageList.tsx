
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreditHistory, CreditUsage } from "@/hooks/useCreditHistory";
import { format } from "date-fns";

export function CreditUsageList() {
  const { usageHistory, isLoading } = useCreditHistory();

  if (isLoading) {
    return <div>Loading credit usage history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Usage History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {usageHistory?.map((usage: CreditUsage) => (
            <div 
              key={usage.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <div className="font-medium">{usage.feature_name}</div>
                <div className="text-sm text-muted-foreground">
                  {usage.description}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(usage.created_at), 'MMM d, yyyy HH:mm')}
                </div>
              </div>
              <div className="font-medium text-right">
                -{usage.credits_used} credits
              </div>
            </div>
          ))}
          
          {!usageHistory?.length && (
            <div className="text-center text-muted-foreground py-4">
              No credit usage history yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
