import React from 'react';
// Corrected import
import { CEOAgent } from '@/lib/agents/CEO_Agent';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/button';

const InsertMissingBlueprints: React.FC = () => {
  const { tenant } = useTenant();

  const insertMissingBlueprints = async () => {
    if (!tenant?.id) {
      console.error('Tenant ID is missing.');
      return;
    }

    try {
      const ceoAgent = new CEOAgent(tenant.id);
      // Example data - replace with actual data if needed
      const industry = "Technology";
      const goals = ["Increase market share", "Improve customer satisfaction"];
      const painPoints = ["High customer churn", "Low conversion rates"];

      const result = await ceoAgent.generateStrategy(industry, goals, painPoints);

      if (result.success) {
        console.log('Strategy generated successfully:', result.strategy);
      } else {
        console.error('Failed to generate strategy:', result.error);
      }
    } catch (error) {
      console.error('Error inserting missing blueprints:', error);
    }
  };

  return (
    <div>
      <Button onClick={insertMissingBlueprints}>
        Insert Missing Blueprints
      </Button>
    </div>
  );
};

export default InsertMissingBlueprints;
