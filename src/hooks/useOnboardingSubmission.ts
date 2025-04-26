
import { useState } from 'react';
import { useTenant } from './useTenant';
import { useNavigate } from 'react-router-dom';
import { OnboardingProfile } from '@/types/onboarding';
import { ToastService } from '@/services/ToastService';
import { useSystemLogs } from './useSystemLogs';

export function useOnboardingSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tenant, updateTenantProfile } = useTenant();
  const navigate = useNavigate();
  const { logActivity } = useSystemLogs();

  const completeOnboarding = async (profile: OnboardingProfile) => {
    if (!tenant) {
      ToastService.error("No active workspace found");
      return { success: false, error: "No active workspace found" };
    }

    setIsSubmitting(true);

    try {
      // Update tenant profile with onboarding data
      await updateTenantProfile({
        ...tenant,
        onboarding_completed: true,
      });

      // Log activity
      try {
        await logActivity({
          event_type: 'ONBOARDING_COMPLETED',
          message: 'User completed onboarding process',
          meta: {
            tenant_id: tenant.id,
            profile: profile
          },
          severity: 'info'
        });
      } catch (logError) {
        console.error("Failed to log onboarding activity:", logError);
      }

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
