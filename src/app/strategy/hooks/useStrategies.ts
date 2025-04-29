
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Strategy, StrategyStatus, mapJsonToStrategy, mapStrategyArray } from "@/types/strategy";
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
        
        // Transform database data to match Strategy type using our utility function
        const typedStrategies = mapStrategyArray(data || []);
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
