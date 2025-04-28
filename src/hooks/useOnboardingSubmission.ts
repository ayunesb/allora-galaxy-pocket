
import { useState } from 'react';
import { useTenant } from './useTenant';
import { useNavigate } from 'react-router-dom';
import { OnboardingProfile } from '@/types/onboarding';
import { toast } from 'sonner';
import { useSystemLogs } from './useSystemLogs';
import { supabase } from "@/integrations/supabase/client";
import { getKitByIndustry } from "@/galaxy/kits/verticals";

export function useOnboardingSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tenant, updateTenantProfile } = useTenant();
  const navigate = useNavigate();
  const { logActivity } = useSystemLogs();

  const completeOnboarding = async (profile: OnboardingProfile) => {
    if (!tenant) {
      toast.error("No active workspace found");
      return { success: false, error: "No active workspace found" };
    }

    setIsSubmitting(true);

    try {
      // Update tenant profile with onboarding completed flag
      if (updateTenantProfile) {
        await updateTenantProfile({
          ...tenant,
          onboarding_completed: true,
        });
      }

      // Save company profile to database
      const { error: companyError } = await supabase
        .from("company_profiles")
        .upsert({
          tenant_id: tenant.id,
          name: profile.companyName,
          industry: profile.industry,
          team_size: profile.teamSize,
          revenue_tier: profile.revenue,
          launch_mode: profile.launch_mode
        });

      if (companyError) throw companyError;

      // Get and apply the appropriate industry kit
      const kit = getKitByIndustry(profile.industry || 'default');
      
      // Create initial KPIs from kit presets
      if (kit.kpiPresets && kit.kpiPresets.length > 0) {
        const kpiMetrics = kit.kpiPresets.map(preset => ({
          tenant_id: tenant.id,
          metric: preset.name,
          value: preset.target || 0, 
          recorded_at: new Date().toISOString()
        }));
        
        const { error: kpiError } = await supabase
          .from('kpi_metrics')
          .upsert(kpiMetrics);
          
        if (kpiError) {
          console.error("Error saving KPI metrics during onboarding:", kpiError);
          // Non-critical, continue despite error
        }
      }
      
      // Create initial strategy from kit
      if (kit.defaultStrategies.length > 0) {
        const defaultStrategy = kit.defaultStrategies[0];
        const { error: strategyError } = await supabase
          .from('strategies')
          .insert({
            tenant_id: tenant.id,
            title: defaultStrategy.title,
            description: defaultStrategy.description,
            status: 'draft',
            tags: defaultStrategy.tags,
            auto_approved: false
          });
          
        if (strategyError) {
          console.error("Error creating default strategy:", strategyError);
          // Non-critical, continue despite error
        }
      }

      // Log successful onboarding completion
      await logActivity({
        event_type: 'ONBOARDING_COMPLETED',
        message: `User completed onboarding process for ${profile.companyName}`,
        meta: {
          tenant_id: tenant.id,
          industry: profile.industry,
          launch_mode: profile.launch_mode
        },
        severity: 'info'
      });

      return { success: true };
    } catch (error: any) {
      console.error('Onboarding submission error:', error);
      return { success: false, error: error.message || "Failed to complete onboarding" };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    completeOnboarding
  };
}
