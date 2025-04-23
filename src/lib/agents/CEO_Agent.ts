import { supabase } from "@/integrations/supabase/client";
import type { OnboardingProfile } from "@/types/onboarding";
import { useAgentFeedback } from "@/app/agents/hooks/useAgentFeedback";

type GenerateFromProfileInput = {
  companyName: string;
  industry: string;
  goal?: string;
  challenges?: string[];
  teamSize?: string;
  sellType?: string;
  tenantId: string;
};

export const CEO_Agent = {
  name: "CEO_Agent",
  personas: [
    "Claire Hughes Johnson",
    "Wes Kao",
    "Andrew Chen",
    "Des Traynor"
  ],
  mission: "Optimize signup → aha moment flow",
  capabilities: [
    "Map onboarding journey",
    "Define success criteria",
    "Recommend fast time-to-value"
  ],
  task_type: "generate-onboarding-flow",
  prompt: `You are an onboarding flow optimizer.
Given a signup context, propose step-by-step onboarding, success criteria, and optimal timeline for user value.`,

  generateStrategyFromProfile: async (profile: GenerateFromProfileInput) => {
    const { getTunedPrompt } = useAgentFeedback();
    const tunedPrompt = await getTunedPrompt(profile.tenantId);

    return `${tunedPrompt}

Company Profile:
- Name: "${profile.companyName}"
- Industry: "${profile.industry}"
- Goal: ${profile.goal || 'Growth and expansion'}
- Team Size: ${profile.teamSize || 'Not specified'}
- Business Type: ${profile.sellType || 'Not specified'}
- Challenges: ${profile.challenges?.join(', ') || 'Not specified'}

Generate a full business strategy including:
- Lead acquisition strategy
- Marketing channel recommendations
- Product/service offers
- Team structure and automation opportunities
- Growth milestones and KPIs

Return the strategy in markdown format.`;
  },

  run: async ({
    founderProfile,
    market,
    notifySlack,
    notifyEmail,
    userEmail,
    kpiInsert,
  }: {
    founderProfile: string;
    market: string;
    notifySlack?: boolean;
    notifyEmail?: boolean;
    userEmail?: string;
    kpiInsert?: boolean;
    saveToDb?: boolean;
  }) => {
    // Call Supabase Edge Function to run OpenAI prompt
    const res = await fetch("/functions/v1/ceo-strategy", {
      method: "POST",
      body: JSON.stringify({ founderProfile, market })
    });

    if (!res.ok) throw new Error("Failed to run CEO_Agent");
    const data = await res.json();
    const strategy: string = data.strategy;

    // Compute and persist "impact_score" (Phases * 10)
    let impactScore: number | undefined;
    let strategyId: string | undefined;

    try {
      impactScore = (strategy.match(/Phase/gi) || []).length * 10;
      // Optionally: insert into "strategies" and update impact_score if edge function supplies id
      if (data.strategyId) {
        strategyId = data.strategyId;
        await supabase
          .from("strategies")
          .update({ impact_score: impactScore })
          .eq("id", strategyId);
      }
    } catch (e) {
      // Soft error, show in logs only
      console.warn("Unable to compute/store impact_score", e);
    }

    // Slack notification (optional)
    if (notifySlack && typeof strategy === "string") {
      try {
        await supabase.functions.invoke("send-webhook-alert", {
          body: {
            message: `📦 New Strategy Created by CEO_Agent\n\n${strategy.slice(0, 400)}...`,
            channel: "slack"
          }
        });
      } catch (err) {
        console.warn("Slack notification failed", err);
      }
    }

    // Email notification (optional)
    if (notifyEmail && userEmail && typeof strategy === "string") {
      try {
        await supabase.functions.invoke("send-email", {
          body: {
            to: userEmail,
            subject: "Your AI Strategy is Ready",
            html: `<pre>${strategy}</pre>`
          }
        });
      } catch (err) {
        console.warn("Email notification failed", err);
      }
    }

    // KPI INSERT (optional)
    if (kpiInsert && typeof strategy === "string") {
      try {
        await supabase.from("kpi_metrics").insert({
          metric: "Execution Plan Depth",
          value: (strategy.match(/Phase/gi) || []).length,
          period: "generated"
        });
      } catch (err) {
        console.warn("KPI metric insert failed", err);
      }
    }

    return { strategy, impactScore };
  }
};

// Add a helper function to generate initial strategy after onboarding
export const generateInitialStrategy = async (profile: OnboardingProfile, tenantId: string) => {
  try {
    const prompt = CEO_Agent.generateStrategyFromProfile({
      companyName: profile.companyName || 'My Company',
      industry: profile.industry || 'Other',
      goal: Array.isArray(profile.goals) ? profile.goals[0] : undefined,
      challenges: profile.challenges,
      teamSize: profile.teamSize,
      sellType: profile.sellType,
      tenantId: tenantId
    });

    // Use Supabase Edge Function to generate the strategy instead of directly calling OpenAI
    const { data, error } = await supabase.functions.invoke("generate-strategy", {
      body: { prompt }
    });

    if (error) throw error;
    const strategy = data.strategy;

    // Save to strategies table
    const { error: saveError } = await supabase.from('strategies').insert({
      title: 'Initial Business Strategy',
      description: 'Auto-generated strategy based on your company profile',
      content: strategy,
      status: 'pending',
      tenant_id: tenantId,
      tags: ['onboarding', 'initial-strategy']
    });

    if (saveError) throw saveError;
    
    return { success: true, strategy };
  } catch (error) {
    console.error('Error generating initial strategy:', error);
    return { success: false, error: error.message };
  }
};
