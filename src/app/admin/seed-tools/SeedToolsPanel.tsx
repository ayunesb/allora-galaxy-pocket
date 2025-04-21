
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export default function SeedToolsPanel() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const runSeed = async (type: string) => {
    try {
      setIsLoading(type);
      
      // In development, we'll use the Supabase client directly
      // This ensures we don't need a separate API endpoint
      if (type === "tenant_profiles") {
        await supabase.from('tenant_profiles').insert([
          { name: 'Allora Test Tenant', usage_credits: 100 },
          { name: 'Galaxy Ventures', usage_credits: 75 }
        ]);
      } else if (type === "vault_strategies") {
        await supabase.from('vault_strategies').insert([
          { title: 'Boost Retention', description: 'Use nudges + AI follow-ups' },
          { title: 'Lower CAC', description: 'Refine paid channels + AI scoring' }
        ]);
      } else if (type === "kpi_metrics") {
        await supabase.from('kpi_metrics').insert([
          { metric: 'MRR', value: 4200 },
          { metric: 'Churn', value: 3.7 },
          { metric: 'UserCount', value: 934 }
        ]);
      } else if (type === "campaigns") {
        await supabase.from('campaigns').insert([
          { name: 'Q2 Lead Gen', status: 'active' },
          { name: 'Nurture Series', status: 'paused' }
        ]);
      } else if (type === "reset") {
        // Delete in reverse order of dependencies
        await supabase.from('campaigns').delete().neq('id', '');
        await supabase.from('kpi_metrics').delete().neq('id', '');
        await supabase.from('vault_strategies').delete().neq('id', '');
        await supabase.from('tenant_profiles').delete().neq('id', '');
      }

      toast.success(`Successfully ran ${type} seed operation`);
    } catch (error) {
      console.error('Seed error:', error);
      toast.error(`Failed to run ${type} seed operation`);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold">🧪 Seed Tools (Dev Only)</h2>
      
      <div className="space-y-3">
        <Button 
          variant="default"
          className="w-full"
          onClick={() => runSeed("tenant_profiles")}
          disabled={!!isLoading}
        >
          Seed Tenant Profiles
        </Button>

        <Button 
          variant="default"
          className="w-full"
          onClick={() => runSeed("vault_strategies")}
          disabled={!!isLoading}
        >
          Seed Vault Strategies
        </Button>

        <Button 
          variant="default"
          className="w-full"
          onClick={() => runSeed("kpi_metrics")}
          disabled={!!isLoading}
        >
          Seed KPI Metrics
        </Button>

        <Button 
          variant="default"
          className="w-full"
          onClick={() => runSeed("campaigns")}
          disabled={!!isLoading}
        >
          Seed Campaigns
        </Button>

        <Button 
          variant="destructive"
          className="w-full"
          onClick={() => runSeed("reset")}
          disabled={!!isLoading}
        >
          ⚠️ Reset All Data
        </Button>
      </div>
    </div>
  );
}
