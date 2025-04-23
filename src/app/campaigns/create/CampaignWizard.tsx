
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

export function CampaignWizard() {
  const [searchParams] = useSearchParams();
  const prefillData = searchParams.get('prefill');

  useEffect(() => {
    if (prefillData) {
      const data = JSON.parse(decodeURIComponent(prefillData));
      // Only update insight when campaign is launched
      const updateInsightWithCampaign = async (campaignId: string) => {
        if (data.insight_id) {
          await supabase
            .from('kpi_insights')
            .update({ 
              campaign_id: campaignId,
              outcome: 'pending'
            })
            .eq('id', data.insight_id);
        }
      };

      // Prefill form fields here
      // ...

      // After campaign creation and launch:
      // updateInsightWithCampaign(newCampaign.id);
    }
  }, [prefillData]);

  // ... rest of campaign wizard implementation
}
