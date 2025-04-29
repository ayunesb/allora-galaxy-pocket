
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreditHistory } from "@/hooks/useCreditHistory";
import { format } from "date-fns";

export interface CreditHistoryItem {
  id: string;
  type: string;
  amount: number;
  created_at: string;
}

export function CreditUsageList() {
  const { history, isLoading } = useCreditHistory();

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
          {history?.map((usage: CreditHistoryItem) => (
            <div 
              key={usage.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <div className="font-medium">{usage.type || "Unknown Operation"}</div>
                <div className="text-sm text-muted-foreground">
                  {usage.type === "general" ? "General usage" : `${usage.type} operation`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(usage.created_at), 'MMM d, yyyy HH:mm')}
                </div>
              </div>
              <div className="font-medium text-right">
                -{usage.amount} credits
              </div>
            </div>
          ))}
          
          {!history?.length && (
            <div className="text-center text-muted-foreground py-4">
              No credit usage history yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
