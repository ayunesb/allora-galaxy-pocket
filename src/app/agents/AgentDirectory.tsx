
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface AgentBlueprint {
  id: string;
  agent_name: string;
  mission: string;
  personas: string[];
}

export default function AgentDirectory() {
  const [agentBlueprints, setAgentBlueprints] = useState<AgentBlueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgentBlueprints = async () => {
      try {
        const { data, error } = await supabase
          .from('agent_blueprints')
          .select('id, agent_name, mission, personas')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAgentBlueprints(data || []);
      } catch (error) {
        console.error('Error fetching agent blueprints:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentBlueprints();
  }, []);

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading agents...</div>;
  }

  return (
    <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
      {agentBlueprints.map((agent) => (
        <div key={agent.id} className="border p-4 rounded-xl shadow bg-background">
          <h3 className="text-lg font-bold">{agent.agent_name}</h3>
          <p className="text-muted-foreground text-sm">{agent.mission}</p>
          <div className="text-xs mt-2">
            <strong>Personas:</strong> {agent.personas.join(", ")}
          </div>
        </div>
      ))}
    </div>
  );
}
