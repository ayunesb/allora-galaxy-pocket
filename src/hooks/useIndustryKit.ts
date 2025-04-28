
import { useState, useEffect } from "react";
import { getKitByIndustry } from "@/galaxy/kits/verticals";
import { IndustryKit } from "@/types/galaxy";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import { Industry } from "@/types/onboarding";
import { toast } from "@/components/ui/sonner";

export function useIndustryKit() {
  const [selectedKit, setSelectedKit] = useState<IndustryKit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();

  // Load the industry kit based on company profile
  useEffect(() => {
    const loadIndustryKit = async () => {
      if (!tenant?.id) return;
      
      setIsLoading(true);
      try {
        // Get the company profile to determine industry
        const { data: companyProfile, error } = await supabase
          .from("company_profiles")
          .select("industry")
          .eq("tenant_id", tenant.id)
          .single();
          
        if (error) throw error;
        
        if (companyProfile?.industry) {
          // Get the appropriate kit based on the industry
          const kit = getKitByIndustry(companyProfile.industry);
          setSelectedKit(kit);
        }
      } catch (error) {
        console.error("Error loading industry kit:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIndustryKit();
  }, [tenant?.id]);

  // Apply kit during onboarding
  const applyKit = async (industry: Industry): Promise<boolean> => {
    if (!tenant?.id) {
      toast.error("No active workspace");
      return false;
    }
    
    setIsLoading(true);
    try {
      const kit = getKitByIndustry(industry);
      setSelectedKit(kit);
      
      // Store recommended KPIs
      if (kit.kpiPresets.length > 0) {
        for (const kpi of kit.kpiPresets) {
          await supabase.from("kpi_metrics").insert({
            tenant_id: tenant.id,
            metric: kpi.name,
            value: 0 // Initial value will be updated later
          });
        }
      }
      
      toast.success(`${kit.name} applied to your workspace`);
      return true;
    } catch (error) {
      console.error("Error applying industry kit:", error);
      toast.error("Failed to apply industry kit");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedKit,
    isLoading,
    applyKit
  };
}
