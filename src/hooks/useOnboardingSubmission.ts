
import { useState } from 'react';
import { useSystemLogs } from './useSystemLogs';
import { useTenant } from './useTenant';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useOnboardingSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { logActivity, logJourneyStep } = useSystemLogs();
  const { tenant, updateTenantProfile } = useTenant();
  const navigate = useNavigate();

  const submitOnboardingData = async (formData: any) => {
    if (!tenant) {
      toast.error('No active workspace found');
      return;
    }

    setIsSubmitting(true);

    try {
      // Log the journey step from onboarding to dashboard
      await logJourneyStep('onboarding', 'dashboard', {
        formData: { ...formData, tenant_id: tenant.id }
      });

      // Update tenant profile with onboarding data
      await updateTenantProfile({
        ...tenant,
        onboarding_completed: true,
        ...formData
      });

      // Log activity
      await logActivity({
        event_type: 'ONBOARDING_COMPLETED',
        message: 'User completed onboarding process',
        meta: {
          tenant_id: tenant.id,
          formData: formData
        },
        severity: 'info'
      });

      // Navigate to dashboard
      navigate('/dashboard');
      
      toast.success('Onboarding completed!', {
        description: 'Welcome to your new workspace'
      });
    } catch (error: any) {
      console.error('Onboarding submission error:', error);
      toast.error('Failed to complete onboarding', {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitOnboardingData
  };
}
