
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { OnboardingProfile } from "@/types/onboarding";
import { generateInitialStrategy } from "@/lib/agents/CEO_Agent";

export function useOnboardingSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const submitOnboardingProfile = async (profile: OnboardingProfile) => {
    if (!user) {
      toast.error("You must be logged in to complete onboarding");
      return false;
    }

    setIsSubmitting(true);
    try {
      // Create tenant profile
      const { data: tenant, error: tenantError } = await supabase
        .from("tenant_profiles")
        .insert({
          name: profile.companyName,
          theme_color: "blue",
          theme_mode: "light"
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Assign user to tenant with admin role
      const { error: roleError } = await supabase
        .from("tenant_user_roles")
        .insert({
          user_id: user.id,
          tenant_id: tenant.id,
          role: "admin"
        });

      if (roleError) throw roleError;

      // Create company profile
      const { error: companyError } = await supabase
        .from("company_profiles")
        .insert({
          tenant_id: tenant.id,
          name: profile.companyName,
          industry: profile.industry,
          team_size: profile.teamSize || "1-10",
          launch_mode: profile.launchMode || "balanced"
        });

      if (companyError) throw companyError;

      // Create persona profile
      const { error: personaError } = await supabase
        .from("persona_profiles")
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          goal: Array.isArray(profile.goals) ? profile.goals[0] : "Growth",
          sell_type: profile.sellType || "B2B",
          channels: profile.channels || ["email", "social"],
          tools: profile.tools || ["website", "email"],
          pain_points: profile.challenges || ["competition", "growth"],
          tone: profile.tone || "professional"
        });

      if (personaError) throw personaError;

      // Log successful onboarding
      await supabase.from("system_logs").insert({
        tenant_id: tenant.id,
        user_id: user.id,
        event_type: "ONBOARDING_COMPLETE",
        message: `Onboarding completed for ${profile.companyName}`,
        meta: {
          industry: profile.industry,
          team_size: profile.teamSize
        }
      });

      // Generate initial strategy based on profile
      toast.promise(generateInitialStrategy(profile, tenant.id), {
        loading: "Generating initial strategy...",
        success: "Initial strategy created",
        error: "Could not generate strategy"
      });

      // Trigger initial campaign generation
      await supabase.functions.invoke("strategy-init", {
        body: {
          tenant_id: tenant.id,
          user_id: user.id
        }
      });

      // Grant initial credits
      const { error: creditsError } = await supabase
        .from("tenant_profiles")
        .update({ usage_credits: 100 })
        .eq("id", tenant.id);

      if (creditsError) {
        console.error("Error granting initial credits:", creditsError);
      }

      toast.success("Welcome to Allora OS!", {
        description: "Your workspace is ready. Let's get started!"
      });

      navigate("/dashboard");
      return true;
    } catch (error: any) {
      console.error("Onboarding submission error:", error);
      toast.error("Onboarding failed", {
        description: error.message
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitOnboardingProfile,
    isSubmitting
  };
}
