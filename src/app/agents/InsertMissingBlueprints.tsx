
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// List of imported agent blueprints' definitions
import { CEO_Agent } from "@/lib/agents/CEO_Agent";
import { CMO_Agent } from "@/lib/agents/CMO_Agent";
import { CFO_Agent } from "@/lib/agents/CFO_Agent";
import { CTO_Agent } from "@/lib/agents/CTO_Agent";
import { Closer_Agent } from "@/lib/agents/Closer_Agent";
import { BrandNarrator_Agent } from "@/lib/agents/BrandNarrator_Agent";
import { GrowthHacker_Agent } from "@/lib/agents/GrowthHacker_Agent";
import { UXWizard_Agent } from "@/lib/agents/UXWizard_Agent";
import { FeatureRoadmap_Agent } from "@/lib/agents/FeatureRoadmap_Agent";
import { TeamBuilder_Agent } from "@/lib/agents/TeamBuilder_Agent";
import { BugSquasher_Agent } from "@/lib/agents/BugSquasher_Agent";
import { CampaignAudit_Agent } from "@/lib/agents/CampaignAudit_Agent";
import { CommunityBuilder_Agent } from "@/lib/agents/CommunityBuilder_Agent";
import { ComplianceGuardian_Agent } from "@/lib/agents/ComplianceGuardian_Agent";
import { CrisisCommander_Agent } from "@/lib/agents/CrisisCommander_Agent";
import { CustomerSuccess_Agent } from "@/lib/agents/CustomerSuccess_Agent";
import { DailyUpdateAgent } from "@/lib/agents/DailyUpdateAgent";
import { EmailCoach_Agent } from "@/lib/agents/EmailCoach_Agent";
import { FeedbackSynthesizer_Agent } from "@/lib/agents/FeedbackSynthesizer_Agent";
import { AIRecruiter_Agent } from "@/lib/agents/AIRecruiter_Agent";
import { InfluencerOps_Agent } from "@/lib/agents/InfluencerOps_Agent";
import { InvestorPitch_Agent } from "@/lib/agents/InvestorPitch_Agent";
import { LaunchArchitect_Agent } from "@/lib/agents/LaunchArchitect_Agent";
import { LegalAdvisor_Agent } from "@/lib/agents/LegalAdvisor_Agent";
import { MarketplaceBuilder_Agent } from "@/lib/agents/MarketplaceBuilder_Agent";
import { OnboardingFlow_Agent } from "@/lib/agents/OnboardingFlow_Agent";
import { PartnershipScouter_Agent } from "@/lib/agents/PartnershipScouter_Agent";
import { PluginScout_Agent } from "@/lib/agents/PluginScout_Agent";
import { RetentionGuru_Agent } from "@/lib/agents/RetentionGuru_Agent";
import { RiskForecast_Agent } from "@/lib/agents/RiskForecast_Agent";

type AgentBlueprintInput = {
  agent_name: string;
  mission: string;
  personas: string[];
  task_type: string;
  capabilities: string[];
  prompt: string;
  output_schema: string;
};

const AGENTS = [
  CEO_Agent,
  CMO_Agent,
  CFO_Agent,
  CTO_Agent,
  Closer_Agent,
  BrandNarrator_Agent,
  GrowthHacker_Agent,
  UXWizard_Agent,
  FeatureRoadmap_Agent,
  TeamBuilder_Agent,
  BugSquasher_Agent,
  CampaignAudit_Agent,
  CommunityBuilder_Agent,
  ComplianceGuardian_Agent,
  CrisisCommander_Agent,
  CustomerSuccess_Agent,
  DailyUpdateAgent,
  EmailCoach_Agent,
  FeedbackSynthesizer_Agent,
  AIRecruiter_Agent,
  InfluencerOps_Agent,
  InvestorPitch_Agent,
  LaunchArchitect_Agent,
  LegalAdvisor_Agent,
  MarketplaceBuilder_Agent,
  OnboardingFlow_Agent,
  PartnershipScouter_Agent,
  PluginScout_Agent,
  RetentionGuru_Agent,
  RiskForecast_Agent
];

function formatAgent(a: any): AgentBlueprintInput {
  return {
    agent_name: a.name,
    mission: a.mission,
    personas: a.personas,
    task_type: a.task_type,
    capabilities: a.capabilities,
    prompt: a.prompt,
    output_schema: JSON.stringify(
      a.run ? a.run({}) : {} // schema sample from .run method
    ),
  };
}

export default function InsertMissingBlueprints() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const insertMissing = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Fetch existing blueprints
      const { data: existing, error } = await supabase
        .from("agent_blueprints")
        .select("agent_name");

      if (error) {
        throw new Error(`Failed to fetch existing blueprints: ${error.message}`);
      }
      
      const existingNames = (existing ?? []).map((a) => a.agent_name);

      // Prepare only agents not present in DB
      const missing = AGENTS.filter((a) => !existingNames.includes(a.name)).map(formatAgent);

      if (missing.length === 0) {
        setResult("No missing agents. All blueprints present!");
        toast({
          title: "Blueprint Check Complete",
          description: "All 30 agent blueprints are already present in the database.",
        });
        setLoading(false);
        return;
      }

      // Insert missing agents in batch
      const { error: insertError, count } = await supabase
        .from("agent_blueprints")
        .insert(missing, { count: "exact" });

      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`);
      } 
      
      const message = `Successfully inserted ${missing.length} agent blueprints`;
      setResult(message);
      toast({
        title: "Agents Added",
        description: message,
      });
    } catch (error: any) {
      const errorMessage = error.message || "An unknown error occurred";
      setResult(`Error: ${errorMessage}`);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={insertMissing}
        disabled={loading}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Inserting...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Insert Missing Agents
          </>
        )}
      </Button>
      {result && (
        <div className={`mt-2 text-sm ${result.includes("Error") ? "text-red-500" : "text-green-500"}`}>
          {result}
        </div>
      )}
    </div>
  );
}
