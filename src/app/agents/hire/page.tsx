
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AGENT_ROLES } from "@/lib/agents/AgentRoles";
import { useTenant } from "@/hooks/useTenant";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AssignmentMap {
  [agent: string]: boolean;
}

export default function AgentHirePage() {
  const [assignments, setAssignments] = useState<AssignmentMap>({});
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState<string | null>(null);
  const { tenant } = useTenant();
  const { toast } = useToast();

  // Fetch agent assignments for current tenant
  useEffect(() => {
    if (!tenant?.id) return;
    setLoading(true);
    supabase
      .from("agent_assignments")
      .select("agent")
      .eq("tenant_id", tenant.id)
      .then(({ data, error }) => {
        if (error) {
          toast({
            title: "Error",
            description: "Failed to load agent assignments.",
            variant: "destructive",
          });
        }
        const assigned = Object.fromEntries((data || []).map((a: any) => [a.agent, true]));
        setAssignments(assigned);
        setLoading(false);
      });
  }, [tenant, toast]);

  // Assign or unassign agent
  const toggleAssignment = async (agentName: string) => {
    if (!tenant?.id) return;
    setChanging(agentName);

    const assigned = assignments[agentName];

    if (assigned) {
      // Unassign
      const { error } = await supabase
        .from("agent_assignments")
        .delete()
        .match({ tenant_id: tenant.id, agent: agentName });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to unassign agent.",
          variant: "destructive",
        });
      } else {
        setAssignments((prev) => ({ ...prev, [agentName]: false }));
      }
    } else {
      // Assign
      const { error } = await supabase
        .from("agent_assignments")
        .insert({ tenant_id: tenant.id, agent: agentName });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to assign agent.",
          variant: "destructive",
        });
      } else {
        setAssignments((prev) => ({ ...prev, [agentName]: true }));
      }
    }
    setChanging(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">💼 Hire Your AI Agents</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Select which agents you want to assign to your company.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground m-8">
          <Loader2 className="animate-spin" /> Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AGENT_ROLES.map((agent) => (
            <div
              key={agent.name}
              className="p-4 border rounded-lg shadow bg-background flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">
                  {agent.emoji} {agent.name}
                </h3>
                <p className="text-sm text-muted-foreground">{agent.purpose}</p>
              </div>
              <Button
                onClick={() => toggleAssignment(agent.name)}
                disabled={changing === agent.name}
                variant={assignments[agent.name] ? "secondary" : "outline"}
                className={
                  assignments[agent.name]
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }
              >
                {changing === agent.name ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-1" />
                ) : assignments[agent.name] ? (
                  "✅ Assigned"
                ) : (
                  "➕ Hire"
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
