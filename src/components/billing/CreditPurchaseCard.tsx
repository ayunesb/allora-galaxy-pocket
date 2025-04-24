
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { usePurchaseCredits } from "@/hooks/usePurchaseCredits";
import { toast } from "sonner";

export function CreditPurchaseCard() {
  const [amount, setAmount] = useState<number>(100);
  const { purchaseCredits, isProcessing } = usePurchaseCredits();

  const handlePurchase = () => {
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid credit amount");
      return;
    }
    purchaseCredits(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Credits</CardTitle>
        <CardDescription>
          Add more credits to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Credit amount"
            min="1"
            disabled={isProcessing}
          />
          <Button 
            onClick={handlePurchase}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Purchase
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Credits will be added to your account immediately after purchase
        </div>
      </CardContent>
    </Card>
  );
}
