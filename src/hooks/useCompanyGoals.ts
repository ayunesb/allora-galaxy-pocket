
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Session } from "@supabase/supabase-js";

export const useCompanyGoals = (session: Session | null) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [revenueTier, setRevenueTier] = useState("");
  const [launchMode, setLaunchMode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load existing goals if any
  useEffect(() => {
    async function fetchCompanyGoals() {
      if (!session?.user?.id) return;
      
      try {
        // Get the user's tenant ID
        const { data: tenantData, error: tenantError } = await supabase
          .from("tenant_user_roles")
          .select("tenant_id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (tenantError || !tenantData?.tenant_id) {
          console.error("Error fetching tenant:", tenantError);
          return;
        }

        // Fetch company profile data including goals
        const { data: profileData, error: profileError } = await supabase
          .from("company_profiles")
          .select("goals, revenue_tier, launch_mode")
          .eq("tenant_id", tenantData.tenant_id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching company goals:", profileError);
          return;
        }

        if (profileData) {
          // Pre-fill form with existing data
          setSelectedGoals(profileData.goals || []);
          setRevenueTier(profileData.revenue_tier || "");
          setLaunchMode(profileData.launch_mode || "");
        }
      } catch (err) {
        console.error("Error loading company goals:", err);
      }
    }

    fetchCompanyGoals();
  }, [session]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal) 
        : [...prev, goal]
    );
  };

  const addCustomGoal = (goal: string) => {
    setSelectedGoals(prev => [...prev, goal]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Get the user's tenant ID
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenant_user_roles")
        .select("tenant_id")
        .eq("user_id", session.user.id)
        .single();

      if (tenantError) {
        throw new Error("Failed to get tenant information");
      }

      const tenantId = tenantData.tenant_id;

      // Update company_profiles with revenue tier, launch mode and goals
      const { data: existingProfile, error: checkError } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing profile:", checkError);
        throw checkError;
      }

      if (existingProfile?.id) {
        const { error: updateError } = await supabase
          .from("company_profiles")
          .update({
            revenue_tier: revenueTier,
            launch_mode: launchMode,
            goals: selectedGoals,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Save persona profile with goals
      const personaGoalsText = selectedGoals.join(", ");
      
      // Save goals to persona_profiles table
      const { error: personaError } = await supabase
        .from("persona_profiles")
        .upsert({
          tenant_id: tenantId,
          user_id: session.user.id,
          goal: personaGoalsText
        }, { onConflict: "tenant_id, user_id" });

      if (personaError) {
        throw personaError;
      }

      // Navigate to dashboard after successful submission
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error saving goals:", err);
      setError(err.message || "Failed to save goals.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedGoals,
    revenueTier,
    launchMode,
    isLoading,
    error,
    toggleGoal,
    addCustomGoal,
    setRevenueTier,
    setLaunchMode,
    handleSubmit,
  };
};
