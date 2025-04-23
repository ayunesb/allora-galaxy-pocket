
import React from "react";
import { usePromptVersioning } from "../hooks/usePromptVersioning";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface Props {
  agentName: string;
  onRestore: (prompt: string, version: number) => void;
}
export default function PromptVersionHistory({ agentName, onRestore }: Props) {
  const { versions, isLoading } = usePromptVersioning(agentName);

  if (isLoading) return <div className="p-2 text-muted-foreground">Loading prompt versions...</div>;
  if (!versions.length) return <div className="p-2 text-muted-foreground">No version history found.</div>;

  return (
    <div className="divide-y divide-muted">
      {versions.map((ver) => (
        <div key={ver.id} className="p-2 flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <div>v{ver.version} {ver.created_at && <>• {new Date(ver.created_at).toLocaleString()}</>}</div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" title="Preview"
                onClick={() => onRestore(ver.prompt, ver.version)}>
                <Eye size={16} className="mr-1" /> Preview
              </Button>
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(ver.prompt)}`}
                download={`agent_${agentName}_v${ver.version}_prompt.txt`}
              >
                <Button size="sm" variant="ghost">
                  <Download size={16} className="mr-1" /> Export
                </Button>
              </a>
            </div>
          </div>
          <pre className="bg-muted rounded p-1 text-xs max-h-24 overflow-y-auto mt-1">{ver.prompt.slice(0, 200)}{ver.prompt.length > 200 ? "..." : ""}</pre>
        </div>
      ))}
    </div>
  );
}
