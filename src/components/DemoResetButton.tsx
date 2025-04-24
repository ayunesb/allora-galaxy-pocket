
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDemoRestrictions } from "@/hooks/useDemoRestrictions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, RefreshCcw } from "lucide-react";
import { format, isToday } from "date-fns";

export function DemoResetButton() {
  const { isDemoMode, resetDemo, isResetting, lastResetTime } = useDemoRestrictions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  if (!isDemoMode) return null;
  
  const handleReset = async () => {
    await resetDemo();
    setIsDialogOpen(false);
  };
  
  const formattedLastReset = lastResetTime 
    ? isToday(new Date(lastResetTime))
      ? `today at ${format(new Date(lastResetTime), 'h:mm a')}`
      : format(new Date(lastResetTime), 'MMM d, yyyy h:mm a')
    : "never";
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsDialogOpen(true)}
        className="ml-auto"
      >
        <RefreshCcw className="h-4 w-4 mr-2" />
        Reset Demo Data
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Demo Data</DialogTitle>
            <DialogDescription>
              This will reset all demo data to its original state. 
              All campaigns, KPIs, and notifications will be reset.
              {lastResetTime && (
                <p className="mt-2">
                  Last reset: {formattedLastReset}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReset}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Demo Data'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
