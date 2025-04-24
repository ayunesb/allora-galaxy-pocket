
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useBillingProfile } from "@/hooks/useBillingProfile";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useCreditsManager } from "@/hooks/useCreditsManager";

export function CreditsDisplay() {
  const { profile, isLoading } = useBillingProfile();
  const { getRemainingCredits } = useCreditsManager();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredits() {
      if (profile) {
        const remaining = await getRemainingCredits();
        setCredits(remaining);
        setLoading(false);
      } else if (!isLoading) {
        setLoading(false);
      }
    }
    
    fetchCredits();
  }, [profile, isLoading, getRemainingCredits]);

  if (loading) {
    return (
      <div className="animate-pulse h-10 w-full bg-gray-200 rounded"></div>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Billing profile not found</AlertTitle>
        <AlertDescription>
          Please contact support if this issue persists.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Get total credits based on plan
  const totalCredits = profile.plan === 'standard' ? 100 : 
                       profile.plan === 'growth' ? 500 : 1000;
                       
  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, (credits / totalCredits) * 100));
  
  // Determine status color
  let statusColor = "text-green-600";
  let progressColor = "bg-green-600";
  
  if (percentage < 25) {
    statusColor = "text-red-600";
    progressColor = "bg-red-600";
  } else if (percentage < 50) {
    statusColor = "text-yellow-600";
    progressColor = "bg-yellow-600";
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className={`font-bold text-2xl ${statusColor}`}>{credits}</span>
        <span className="text-sm text-muted-foreground">of {totalCredits} credits</span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2"
        indicatorClassName={progressColor} 
      />
      
      <p className="text-sm text-muted-foreground mt-2">
        Credits renew with your billing cycle
      </p>
    </div>
  );
}
