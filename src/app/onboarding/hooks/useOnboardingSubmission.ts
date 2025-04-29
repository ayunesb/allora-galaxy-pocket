
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { Strategy } from '@/types/strategy';

interface OnboardingData {
  companyName: string;
  industry: string;
  companySize: string;
  goals: string[];
  painPoints: string[];
}

export const useOnboardingSubmission = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: OnboardingData): Promise<Strategy | null> => {
    setIsLoading(true);
    try {
      if (!user?.id || !tenant?.id) {
        throw new Error("User or Tenant ID not available");
      }

      const initialData = {
        company_name: data.companyName,
        industry: data.industry,
        company_size: data.companySize,
        goals: data.goals,
        pain_points: data.painPoints
      };

      // Update logActivity to use positional parameters
      await logActivity(
        'ONBOARDING_STARTED',
        'User started onboarding process',
        { step: 1, data: initialData }
      );

      const { data: strategy, error } = await supabase
        .from('strategies')
        .insert({
          tenant_id: tenant.id,
          created_by: user.id,
          title: `AI Strategy for ${data.companyName}`,
          description: `AI-generated strategy for ${data.companyName} in the ${data.industry} industry.`,
          tags: [data.industry, ...data.goals, ...data.painPoints],
          status: 'pending',
          strategy_data: initialData
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create strategy: ${error.message}`);
      }

      await logActivity(
        'ONBOARDING_COMPLETED', 
        'User completed onboarding process',
        { 
          strategy_id: strategy?.id,
          user_id: user?.id,
          company_info: data
        }
      );

      toast({
        title: "Onboarding Complete",
        description: "Your AI strategy is being generated. Check back soon!",
      });

      // Cast to Strategy type
      return strategy as unknown as Strategy;
    } catch (err: any) {
      console.error("Onboarding submission error:", err);
      toast({
        variant: "destructive",
        title: "Onboarding Failed",
        description: err.message || "Failed to submit onboarding data.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting: isLoading,
    // Add completeOnboarding as an alias to handleSubmit for backward compatibility
    completeOnboarding: handleSubmit
  };
};
