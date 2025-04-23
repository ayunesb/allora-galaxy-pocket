
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTenant } from "@/hooks/useTenant";
import { BillingPreview } from "@/components/billing/BillingPreview";
import { CreditsPlanCard } from "./components/CreditsPlanCard";
import { PaymentMethodsCard } from "./components/PaymentMethodsCard";
import { BillingHistoryCard } from "./components/BillingHistoryCard";
import { CreditExportButton } from "@/components/billing/CreditExportButton";
import { InvoiceGenerator } from "@/components/billing/InvoiceGenerator";

export default function BillingPanel() {
  const { tenant } = useTenant();
  const [showDetails, setShowDetails] = useState(false);

  // If there's no tenant loaded yet, show a loading state
  if (!tenant) {
    return (
      <Card className="max-w-md mx-auto">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <CreditsPlanCard />
      
      <div className="flex flex-wrap gap-2 justify-end">
        <CreditExportButton />
        <InvoiceGenerator />
      </div>
      
      {showDetails && <BillingPreview />}
      
      <div className="flex justify-center">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowDetails(prev => !prev)}
        >
          {showDetails ? "Hide Details" : "Show More Details"}
        </Button>
      </div>

      <PaymentMethodsCard />
      <BillingHistoryCard />
    </div>
  );
}
