
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard, ChevronRight } from "lucide-react";
import { useBillingProfile } from "@/hooks/useBillingProfile";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface CreditCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits: number;
  featureDescription: string;
  onProceed: () => void;
}

export function CreditCheckModal({
  isOpen,
  onClose,
  requiredCredits,
  featureDescription,
  onProceed,
}: CreditCheckModalProps) {
  const { profile, isLoading } = useBillingProfile();
  
  if (isLoading || !profile) {
    return null;
  }
  
  const hasEnoughCredits = profile.credits >= requiredCredits;
  const currentCredits = profile.credits;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Credit Confirmation</DialogTitle>
          <DialogDescription>
            This action requires credits from your plan.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium">Required Credits</p>
              <p className="text-2xl font-bold">{requiredCredits}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-right">Your Credits</p>
              <p className={`text-2xl font-bold text-right ${hasEnoughCredits ? 'text-green-600' : 'text-red-600'}`}>
                {currentCredits}
              </p>
            </div>
          </div>
          
          <Progress 
            value={(currentCredits / Math.max(currentCredits, requiredCredits)) * 100} 
            className={`h-2 ${hasEnoughCredits ? 'bg-muted' : 'bg-red-100'}`}
          />
          
          <div className="mt-4 p-3 border rounded-md">
            <p className="text-sm font-medium">Feature Description</p>
            <p className="text-sm text-muted-foreground">{featureDescription}</p>
          </div>
          
          {!hasEnoughCredits && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 text-red-800 rounded-md">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Not enough credits</p>
                <p className="text-sm">
                  You need {requiredCredits - currentCredits} more credits to use this feature.
                  Consider upgrading your plan or waiting for your monthly reset.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-col gap-2">
          {hasEnoughCredits ? (
            <>
              <Button onClick={onProceed} className="w-full">
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="w-full">
                <Link to="/billing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Link>
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
