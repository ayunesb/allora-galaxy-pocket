
'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AgentMemoryLog } from "@/types/agent";
import MemoryTable from "../components/MemoryTable";

export default function AgentMemoryConsole() {
  const [logs, setLogs] = useState<AgentMemoryLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("agent_memory")
        .select("*")
        .order("timestamp", { ascending: false });
      
      if (error) {
        console.error("Error fetching agent memory:", error);
        return;
      }
      
      setLogs(data || []);
    };

    fetchLogs();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧠 Agent Memory Console</h1>
      <MemoryTable logs={logs} />
    </div>
  );
}
