
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePromptVersioning } from "../hooks/usePromptVersioning";
import PromptVersionHistory from "./PromptVersionHistory";
import { Save, Download, ArrowRight } from "lucide-react";

// For simplicity, props: agentName, initialPrompt; onUpdate replaces the prompt on parent (for sync)
interface Props {
  agentName: string;
  initialPrompt: string;
  onUpdate: (newPrompt: string) => void;
}

export default function AgentPromptEditor({
  agentName,
  initialPrompt,
  onUpdate
}: Props) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [showTest, setShowTest] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
  const { toast } = useToast();
  const {
    savePromptVersion,
    restorePromptVersion,
    isSaving
  } = usePromptVersioning(agentName);

  // Save current as a new version
  const handleSave = async () => {
    try {
      await savePromptVersion({ prompt });
      onUpdate(prompt); // update on parent
      toast({ title: "Prompt Version Saved", description: "Version history updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Live test output
  const runTestPrompt = async () => {
    setShowTest(true);
    setTestResult("Loading...");
    try {
      const response = await fetch("/api/agent/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, agent: agentName })
      });
      const data = await response.json();
      setTestResult(data.result || JSON.stringify(data));
    } catch (err: any) {
      setTestResult("Test failed: " + err.message);
    }
  };

  // Export/push to production: download file
  const pushToProduction = () => {
    const content = `export const ${agentName}_Agent = {
  prompt: \`${prompt}\`,
  run: async (payload) => {
    // Implement the output logic here
    return {};
  }
}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${agentName}_Agent.ts`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Restore from history
  const handlePreviewRestore = (restoredPrompt: string, version: number) => {
    setPrompt(restoredPrompt);
    toast({ title: `Restored v${version}`, description: "You may now save as a new version." });
  };

  return (
    <div>
      <div className="mb-2 text-lg font-medium">Prompt Editor</div>
      <textarea
        className="w-full rounded border p-2 mb-2 text-sm bg-background"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={10}
      />
      <div className="flex flex-wrap gap-2 mb-3">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save size={16} className="mr-1" />
          {isSaving ? "Saving..." : "Save As New Version"}
        </Button>
        <Button onClick={runTestPrompt} variant="secondary">
          <ArrowRight size={16} className="mr-1" />
          Preview Output
        </Button>
        <Button onClick={pushToProduction} variant="outline">
          <Download size={16} className="mr-1" />
          Push to Production
        </Button>
      </div>
      {showTest && (
        <div className="mt-2">
          <div className="font-medium text-sm mb-1">Test Result:</div>
          <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
            {testResult}
          </pre>
        </div>
      )}
      <div className="mt-6">
        <div className="font-bold mb-2">Version History</div>
        <PromptVersionHistory agentName={agentName} onRestore={handlePreviewRestore} />
      </div>
    </div>
  );
}
