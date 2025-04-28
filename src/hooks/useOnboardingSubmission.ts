
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
      // Update tenant profile with onboarding data
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
      
      // Create initial strategy from kit
      if (kit.defaultStrategies.length > 0) {
        const defaultStrategy = kit.defaultStrategies[0];
        await supabase
          .from('strategies')
          .insert({
            tenant_id: tenant.id,
            title: defaultStrategy.title,
            description: defaultStrategy.description,
            status: 'draft',
            tags: defaultStrategy.tags,
            auto_approved: false
          });
      }

      // Log activity
      await logActivity({
        event_type: 'ONBOARDING_COMPLETED',
        message: 'User completed onboarding process',
        meta: {
          tenant_id: tenant.id,
          profile: profile
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
