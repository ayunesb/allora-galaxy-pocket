
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getKitByIndustry } from "@/galaxy/kits/verticals";
import { Industry } from "@/types/onboarding";
import { useTenant } from './useTenant';

/**
 * Hook for applying industry-specific starter kits during onboarding
 */
export function useIndustryKit() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();
  
  /**
   * Applies the industry-specific starter kit to the tenant
   * @param industry The industry selected during onboarding
   * @returns true if successful, false otherwise
   */
  const applyKit = async (industry: Industry): Promise<boolean> => {
    if (!tenant?.id) {
      toast.error("No active workspace found");
      return false;
    }
    
    setIsLoading(true);
    try {
      // Get the appropriate kit based on industry
      const kit = getKitByIndustry(industry);
      
      // Create default KPI metrics from kit presets
      if (kit.kpiPresets && kit.kpiPresets.length > 0) {
        const kpiMetrics = kit.kpiPresets.map(preset => ({
          tenant_id: tenant.id,
          metric: preset.name,
          value: 0, // Initial value
        }));
        
        const { error: kpiError } = await supabase
          .from('kpi_metrics')
          .upsert(kpiMetrics);
          
        if (kpiError) {
          console.error("Error creating KPI metrics:", kpiError);
          // Continue despite errors - non-critical
        }
      }
      
      // Create default strategies from kit
      if (kit.defaultStrategies && kit.defaultStrategies.length > 0) {
        const strategies = kit.defaultStrategies.map(strategy => ({
          tenant_id: tenant.id,
          title: strategy.title,
          description: strategy.description,
          status: 'draft',
          tags: strategy.tags,
          auto_approved: false
        }));
        
        const { error: strategyError } = await supabase
          .from('strategies')
          .upsert(strategies);
          
        if (strategyError) {
          console.error("Error creating default strategies:", strategyError);
          toast.error("Failed to create starter strategies");
          return false;
        }
      }
      
      // Set up recommended agents
      if (kit.recommendedAgents && kit.recommendedAgents.length > 0) {
        // This would typically link to agent setup
        // For now, we'll just log this action
        console.log("Setting up recommended agents:", kit.recommendedAgents);
      }
      
      toast.success(`${industry} starter kit applied successfully`);
      return true;
    } catch (error) {
      console.error("Error applying industry kit:", error);
      toast.error("Failed to apply industry starter kit");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    applyKit,
    isLoading
  };
}
