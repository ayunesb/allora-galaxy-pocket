
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BillingHistoryCard() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Billing History</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          View your past invoices and payment history
        </p>
        <Button variant="outline" className="w-full">
          View Billing History
        </Button>
      </CardContent>
    </Card>
  );
}
