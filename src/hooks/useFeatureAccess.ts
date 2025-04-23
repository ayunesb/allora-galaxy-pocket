
import { useBillingProfile } from "./useBillingProfile";
import { useCreditsManager } from "./useCreditsManager";
import { toast } from "sonner";
import { useState } from "react";

type FeatureTier = "free" | "standard" | "growth" | "pro";

interface FeatureDefinition {
  name: string;
  id: string; 
  creditCost: number;
  description: string;
  requiredTier?: FeatureTier;
}

// Feature credit costs and tiers
const FEATURES: Record<string, FeatureDefinition> = {
  CREATE_STRATEGY: {
    name: "Create Strategy",
    id: "create_strategy",
    creditCost: 5,
    description: "Create a new strategy with AI assistance"
  },
  EXPORT_DATA: {
    name: "Export Data",
    id: "export_data",
    creditCost: 1,
    description: "Export data to various formats"
  },
  RECOVERY_PLAN: {
    name: "Recovery Plan",
    id: "recovery_plan",
    creditCost: 10,
    description: "Generate an AI recovery plan",
    requiredTier: "growth"
  },
  AI_ANALYTICS: {
    name: "AI Analytics",
    id: "ai_analytics",
    creditCost: 15,
    description: "Run AI-powered analytics",
    requiredTier: "pro"
  }
};

export function useFeatureAccess(featureId: string) {
  const { profile, isLoading: profileLoading } = useBillingProfile();
  const { useCredits, hasEnoughCredits, getRemainingCredits } = useCreditsManager();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get feature definition
  const feature = FEATURES[featureId] || {
    name: "Unknown Feature",
    id: featureId,
    creditCost: 1,
    description: "Access platform feature"
  };
  
  const hasRequiredTier = !feature.requiredTier || 
    (profile?.plan === feature.requiredTier || 
    (feature.requiredTier === "standard" && ["growth", "pro"].includes(profile?.plan || "")) ||
    (feature.requiredTier === "growth" && profile?.plan === "pro"));
    
  const canUseFeature = hasRequiredTier && hasEnoughCredits(feature.creditCost);
  
  // Function to consume credits and use feature
  const useFeature = async (callback: () => Promise<void> | void) => {
    if (isProcessing || profileLoading) {
      toast.error("Please wait", { description: "A request is already being processed" });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // First check if user can access feature
      if (!hasRequiredTier) {
        toast.error(`Upgrade required`, { 
          description: `This feature requires ${feature.requiredTier} plan or higher`
        });
        return;
      }
      
      // Then check if user has enough credits
      if (!hasEnoughCredits(feature.creditCost)) {
        toast.error(`Not enough credits`, { 
          description: `You need ${feature.creditCost} credits for this feature, but have ${getRemainingCredits()}` 
        });
        return;
      }
      
      // Use credits
      const creditSuccess = await useCredits(
        feature.creditCost, 
        `Feature: ${feature.name}`, 
        "System"
      );
      
      if (!creditSuccess) {
        toast.error("Failed to use credits", { description: "Please try again later" });
        return;
      }
      
      // Execute callback
      await callback();
      
    } catch (err) {
      console.error("Error using feature:", err);
      toast.error("An error occurred", { 
        description: "There was a problem accessing this feature" 
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    useFeature,
    canUseFeature,
    isProcessing,
    creditCost: feature.creditCost,
    featureName: feature.name,
    featureDescription: feature.description,
    requiredPlanUpgrade: !hasRequiredTier ? feature.requiredTier : undefined
  };
}
