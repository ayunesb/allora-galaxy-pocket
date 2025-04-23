
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VersionEntry {
  id: string;
  agent_name: string;
  prompt: string;
  version: number;
  created_at: string;
}

interface PartialVersionEntry {
  id: string;
  version: number;
  prompt: string;
}

export function VersionList({
  agent,
  onSelect,
}: {
  agent: string;
  onSelect: (prompt: string) => void;
}) {
  const [history, setHistory] = useState<VersionEntry[]>([]);

  useEffect(() => {
    const fetch = async () => {
      if (!agent) return setHistory([]);
      
      const { data } = await supabase
        .from("agent_prompt_versions")
        .select("id, version, prompt, created_at, agent_name")
        .eq("agent_name", agent)
        .order("version", { ascending: false });
        
      // Ensure we have all the required fields or set defaults
      const typedData = data?.map(item => ({
        id: item.id,
        version: item.version,
        prompt: item.prompt,
        agent_name: item.agent_name || agent,
        created_at: item.created_at || new Date().toISOString()
      })) as VersionEntry[] || [];
      
      setHistory(typedData);
    };
    fetch();
  }, [agent]);

  return (
    <div className="mt-4">
      <h4 className="font-semibold text-sm mb-2">🧾 Prompt History</h4>
      <ul className="text-xs space-y-2">
        {history.map((v) => (
          <li
            key={v.id}
            className="bg-muted p-2 rounded cursor-pointer hover:bg-muted-foreground/10"
            onClick={() => onSelect(v.prompt)}
            title={v.prompt}
          >
            v{v.version}: {v.prompt.slice(0, 60)}...
          </li>
        ))}
      </ul>
    </div>
  );
}
