
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PaymentMethodsCard() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Payment Methods</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Add or manage your payment methods
        </p>
        <Button variant="outline" className="w-full">
          Manage Payment Methods
        </Button>
      </CardContent>
    </Card>
  );
}
