
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  if (loading) return <div className="text-muted-foreground">Checking agent blueprints count...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="mb-4">
      <span className="font-semibold">Agent blueprints in DB:</span>{" "}
      <span className="font-mono">{count}</span>
      {count !== null && count < 30 && (
        <span className="ml-3 text-yellow-600">({30 - count} more to add)</span>
      )}
      {count !== null && count >= 30 && (
        <span className="ml-3 text-green-600">All 30 agents present!</span>
      )}
    </div>
  );
}
