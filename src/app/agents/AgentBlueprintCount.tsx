
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

export default function AgentBlueprintCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCount() {
      setLoading(true);
      setError(null);
      const { count, error } = await supabase
        .from("agent_blueprints")
        .select("id", { count: "exact", head: true });
      if (error) {
        setError("Error fetching count");
        setCount(null);
      } else {
        setCount(count ?? 0);
      }
      setLoading(false);
    }
    fetchCount();
  }, []);

  if (loading) return <div className="text-muted-foreground">Checking agent blueprints...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold">Agent Blueprints:</span>
      <Badge variant="outline" className="text-base font-mono">{count}</Badge>
      {count !== null && count < 30 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          <span>{30 - count} more to add</span>
        </Badge>
      )}
      {count !== null && count >= 30 && (
        <Badge variant="success" className="bg-green-500 text-white">
          All 30 agents present!
        </Badge>
      )}
    </div>
  );
}
