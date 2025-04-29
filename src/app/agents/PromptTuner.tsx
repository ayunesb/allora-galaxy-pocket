
import React, { useState } from 'react';
import { CEOAgent } from '@/lib/agents/CEO_Agent';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/button';

const InsertMissingBlueprints: React.FC = () => {
  const { tenant } = useTenant();
  const [preview, setPreview] = useState("");
  const [inputs, setInputs] = useState({ profile: "", market: "" });
  const [loading, setLoading] = useState(false);

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
        setPreview(result.strategy || "Strategy generated successfully");
      } else {
        console.error('Failed to generate strategy:', result.error);
        setPreview("Error: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error('Error inserting missing blueprints:', error);
      setPreview("Error: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
    <div>
      <Button onClick={insertMissingBlueprints}>
        Insert Missing Blueprints
      </Button>
      {preview && (
        <pre className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap">
          {preview}
        </pre>
      )}
    </div>
  );
};

export default InsertMissingBlueprints;
