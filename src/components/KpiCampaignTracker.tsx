
import { useEffect, useState } from "react";
import { useTenant } from "@/hooks/useTenant";
import { useUnifiedKpiAlerts } from "@/hooks/useUnifiedKpiAlerts";
import { Loader2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ToastService } from "@/services/ToastService";
import { cn } from "@/lib/utils";

interface KpiCampaignTrackerProps {
  interval?: number; // in milliseconds
  onUpdate?: () => void;
  showNotifications?: boolean;
  autoRetryOnError?: boolean;
  maxRetries?: number;
  minimized?: boolean;
  className?: string;
}

export function KpiCampaignTracker({ 
  interval = 60000 * 15, // Default: check every 15 minutes 
  onUpdate,
  showNotifications = false,
  autoRetryOnError = true,
  maxRetries = 3,
  minimized = false,
  className
}: KpiCampaignTrackerProps) {
  const { tenant } = useTenant();
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastSuccessfulCheck, setLastSuccessfulCheck] = useState<Date | null>(null);
  const { triggerKpiCheck } = useUnifiedKpiAlerts();
  
  const checkKpis = async () => {
    if (!tenant?.id || isChecking) return;
    
    try {
      setIsChecking(true);
      setCheckError(null);
      
      const success = await triggerKpiCheck(tenant.id);
      
      if (success) {
        setLastSuccessfulCheck(new Date());
        setRetryCount(0);
        
        // Optionally notify parent component of successful update
        if (onUpdate) onUpdate();
        
        if (showNotifications) {
          ToastService.success({
            title: "KPI check completed successfully"
          });
        }
      } else {
        throw new Error("KPI check failed");
      }
    } catch (error: any) {
      console.error("Error checking KPI alerts:", error);
      setCheckError(error.message || "Unknown error");
      
      if (autoRetryOnError && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        
        // Exponential backoff for retries
        const backoffTime = Math.pow(2, retryCount) * 1000;
        
        if (showNotifications) {
          ToastService.warning({
            title: `KPI check failed, retrying in ${backoffTime/1000}s`,
            description: error.message
          });
        }
        
        setTimeout(() => {
          checkKpis();
        }, backoffTime);
      } else if (showNotifications) {
        ToastService.error({
          title: "Failed to check KPIs",
          description: error.message
        });
      }
    } finally {
      setIsChecking(false);
    }
  };
  
  // Run a check on component mount and then on interval
  useEffect(() => {
    if (!tenant?.id) return;
    
    // Initial check
    checkKpis();
    
    // Set up interval for periodic checking
    const timer = setInterval(checkKpis, interval);
    
    return () => clearInterval(timer);
  }, [tenant?.id, interval]);
  
  // Force check KPI alerts
  const forceCheck = async () => {
    setRetryCount(0);
    await checkKpis();
  };
  
  if (minimized) {
    return (
      <div className={cn("inline-flex items-center gap-2 text-sm", className)}>
        {isChecking ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-muted-foreground">Checking KPIs...</span>
          </>
        ) : checkError ? (
          <>
            <AlertCircle className="h-3 w-3 text-destructive" />
            <span className="text-muted-foreground">KPI check error</span>
            <Button size="sm" variant="ghost" onClick={forceCheck} className="h-6 w-6 p-0">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </>
        ) : lastSuccessfulCheck ? (
          <>
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-muted-foreground">
              Updated {lastSuccessfulCheck.toLocaleTimeString()}
            </span>
          </>
        ) : null}
      </div>
    );
  }
  
  // This component shows errors and loading state when showNotifications is true
  if (showNotifications) {
    if (isChecking) {
      return (
        <div className="fixed bottom-4 right-4 bg-background border border-border rounded-md p-2 shadow-md flex items-center gap-2 z-50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Checking KPIs...</span>
        </div>
      );
    }
    
    if (checkError) {
      return (
        <Alert variant="destructive" className={cn("my-4", className)}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p className="text-sm">Error checking KPIs: {checkError}</p>
            <Button size="sm" variant="outline" onClick={forceCheck}>
              Retry Check
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    
    if (lastSuccessfulCheck && showNotifications) {
      return (
        <div className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-2 shadow-md flex items-center gap-2 z-50 animate-fadeOut">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm">KPI check completed at {lastSuccessfulCheck.toLocaleTimeString()}</span>
        </div>
      );
    }
  }
  
  return null;
}
