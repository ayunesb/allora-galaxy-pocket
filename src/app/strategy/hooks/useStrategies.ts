
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Strategy, StrategyStatus } from "@/types/strategy";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import type { OnboardingProfile } from "@/types/onboarding";

export function useStrategies() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [onboardingProfile, setOnboardingProfile] = useState<OnboardingProfile | null>(null);

  useEffect(() => {
    async function fetchStrategies() {
      if (!tenant?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('strategies')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Transform database data to match Strategy type
        const typedStrategies: Strategy[] = (data || []).map(item => ({
          id: item.id,
          title: item.title || '',
          description: item.description || '',
          status: item.status as StrategyStatus,
          created_at: item.created_at,
          tenant_id: item.tenant_id,
          user_id: item.user_id,
          tags: item.tags || [],
          generated_by: item.generated_by || 'CEO Agent',
          assigned_agent: item.assigned_agent || '',
          auto_approved: item.auto_approved || false,
          impact_score: item.impact_score || 0,
          health_score: item.health_score || 0,
          approved_at: item.approved_at,
          updated_at: item.updated_at || item.created_at,
          metrics_baseline: item.metrics_baseline || {},
          metrics_target: item.metrics_target || {},
          onboarding_data: item.onboarding_data || {},
          diagnosis: item.diagnosis || {},
          failure_reason: item.failure_reason,
          is_public: item.is_public || false,
          version: item.version || 1,
          reason_for_recommendation: item.reason_for_recommendation || '',
          target_audience: item.target_audience || '',
          goals: item.goals || [],
          channels: item.channels || [],
          kpis: item.kpis || []
        }));
        
        setStrategies(typedStrategies);
      } catch (err: any) {
        console.error("Failed to fetch strategies:", err);
        setError("Failed to load strategies. Please refresh the page.");
        toast.error("Error loading strategies: " + (err.message || "Please try again"));
      } finally {
        setLoading(false);
      }
    }
    
    fetchStrategies();
  }, [tenant?.id]);

  const handleCreateStrategy = () => {
    navigate("/strategy-gen/new", { 
      state: { 
        onboardingProfile,
        returnPath: "/strategy"
      }
    });
  };

  const handleStrategySelect = (strategy: Strategy) => {
    navigate(`/strategy/${strategy.id}`);
  };

  return {
    loading,
    error,
    strategies,
    onboardingProfile,
    setOnboardingProfile,
    handleCreateStrategy,
    handleStrategySelect,
  };
}
