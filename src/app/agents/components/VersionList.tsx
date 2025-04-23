
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VersionEntry {
  id: string;
  agent_name: string;
  prompt: string;
  version: number;
  created_at: string;
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
        .select("id, version, prompt")
        .eq("agent_name", agent)
        .order("version", { ascending: false });
      setHistory(data || []);
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
