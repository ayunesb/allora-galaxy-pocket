
'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AgentMemory } from "@/types/agent";
import MemoryTable from "../components/MemoryTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";

export default function AgentMemoryConsole() {
  const [logs, setLogs] = useState<AgentMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("agent_memory")
          .select("*")
          .order("timestamp", { ascending: false });
        
        if (error) {
          throw error;
        }
        
        const formattedData = (data || []).map(item => ({
          ...item,
          summary: item.summary || item.context.substring(0, 100) + (item.context.length > 100 ? "..." : ""),
          tags: item.tags || []
        })) as AgentMemory[];
        
        setLogs(formattedData);
      } catch (err) {
        console.error("Error fetching agent memory:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch agent memory"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center">
        <LoadingSpinner size="lg" label="Loading agent memory data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorAlert 
          title="Failed to load agent memory" 
          description={error.message}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧠 Agent Memory Console</h1>
      <MemoryTable logs={logs} />
    </div>
  );
}
