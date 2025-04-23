import { useState, useCallback } from "react";
import { useBillingProfile } from "@/hooks/useBillingProfile";
import { CreditCheckModal } from "@/components/billing/CreditCheckModal";

interface UseBillingAlertOptions {
  requiredCredits: number;
  featureDescription: string;
}

export function useBillingAlert({ requiredCredits, featureDescription }: UseBillingAlertOptions) {
  const { profile } = useBillingProfile();
  const [showCreditCheck, setShowCreditCheck] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void | null>(null);

  const checkCreditsBeforeAction = useCallback((action: () => void) => {
    // If no profile, or we have enough credits, just perform the action
    if (!profile || profile.credits >= requiredCredits) {
      action();
      return;
    }

    // Otherwise show the credit check modal
    setPendingAction(() => action);
    setShowCreditCheck(true);
  }, [profile, requiredCredits]);

  const handleProceed = useCallback(() => {
    if (pendingAction) {
      pendingAction();
    }
    setShowCreditCheck(false);
    setPendingAction(null);
  }, [pendingAction]);

  const handleCancel = useCallback(() => {
    setShowCreditCheck(false);
    setPendingAction(null);
  }, []);

  // Component to render that includes the modal
  const BillingAlertModal = useCallback(() => (
    <CreditCheckModal
      isOpen={showCreditCheck}
      onClose={handleCancel}
      onProceed={handleProceed}
      requiredCredits={requiredCredits}
      featureDescription={featureDescription}
    />
  ), [showCreditCheck, handleCancel, handleProceed, requiredCredits, featureDescription]);

  return {
    checkCreditsBeforeAction,
    BillingAlertModal,
    hasEnoughCredits: !profile ? true : profile.credits >= requiredCredits,
    userCredits: profile?.credits || 0
  };
}
