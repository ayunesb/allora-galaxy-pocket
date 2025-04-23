
"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { generateAgentFile } from "./AgentFileWriter";
import { supabase } from "@/integrations/supabase/client";

const defaultPersonas = [
  "Sheryl Sandberg", "Tim Cook", "Gwynne Shotwell", "Thomas Kurian",
  "Elon Musk", "Satya Nadella", "Reed Hastings", "Susan Wojcicki",
  "Alex Hormozi", "Diane Greene", "Edward Snowden", "Gary Vee"
];

export default function AgentGeneratorWizard() {
  const [agentName, setAgentName] = useState("");
  const [personas, setPersonas] = useState<string[]>([]);
  const [mission, setMission] = useState("");
  const [capabilities, setCapabilities] = useState([""]);
  const [taskType, setTaskType] = useState("");
  const [outputSchema, setOutputSchema] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePersonaToggle = (p: string) => {
    setPersonas((prev) =>
      prev.includes(p) ? prev.filter((i) => i !== p) : [...prev, p]
    );
  };

  const handleExport = () => {
    const content = generateAgentFile({
      agentName,
      mission,
      personas,
      capabilities,
      taskType,
      outputSchema,
      prompt
    });
    const blob = new Blob([content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${agentName || "Agent"}_Agent.ts`;
    link.click();
  };

  const saveToSupabase = async () => {
    setLoading(true);
    try {
      const userResp = await supabase.auth.getUser();
      const user = userResp.data.user;
      if (!user) {
        alert("You must be logged in to save blueprints.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.from("agent_blueprints").insert({
        agent_name: agentName,
        personas,
        mission,
        capabilities,
        task_type: taskType,
        output_schema: outputSchema,
        prompt,
        created_by: user.id
      });
      if (error) {
        alert("Error saving to Supabase: " + error.message);
      } else {
        alert("Blueprint saved to Supabase!");
      }
    } catch (err: any) {
      alert("Unexpected error: " + (err.message || err));
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
        <span role="img" aria-label="brain">🧠</span>
        Agent Generator Wizard
      </h1>

      <div className="mb-4">
        <Label htmlFor="agentName" className="font-semibold mb-1 block">
          Agent Name
        </Label>
        <Input
          id="agentName"
          placeholder="Agent Name (e.g., CFO_Agent)"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="mb-4">
        <Label className="font-semibold mb-1 block">🎓 Composite Personas</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {defaultPersonas.map((p) => (
            <Button
              key={p}
              type="button"
              variant={personas.includes(p) ? "default" : "outline"}
              className={personas.includes(p) ? "bg-primary text-white" : ""}
              onClick={() => handlePersonaToggle(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="mission" className="font-semibold mb-1 block">
          Mission
        </Label>
        <Textarea
          id="mission"
          placeholder="What is the agent’s mission?"
          rows={2}
          value={mission}
          onChange={e => setMission(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="capabilities" className="font-semibold mb-1 block">
          Capabilities
        </Label>
        <Textarea
          id="capabilities"
          placeholder="List agent capabilities (bullet style, one per line)"
          rows={3}
          value={capabilities.join('\n')}
          onChange={e => setCapabilities(e.target.value.split('\n'))}
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="taskType" className="font-semibold mb-1 block">
          Task Type Trigger
        </Label>
        <Input
          id="taskType"
          placeholder="agent_tasks trigger type (e.g., generate-strategy)"
          value={taskType}
          onChange={e => setTaskType(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="outputSchema" className="font-semibold mb-1 block">
          Output Schema
        </Label>
        <Textarea
          id="outputSchema"
          placeholder="Output schema (JSON or bullet format)"
          rows={3}
          value={outputSchema}
          onChange={e => setOutputSchema(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <Label htmlFor="prompt" className="font-semibold mb-1 block">
          Agent Prompt
        </Label>
        <Textarea
          id="prompt"
          placeholder="Prompt this agent will use internally"
          rows={4}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="text-sm"
          onClick={handleExport}
          disabled={!agentName}
        >
          📄 Export .ts File
        </Button>
        <Button
          type="button"
          variant="default"
          className="bg-primary text-white"
          onClick={saveToSupabase}
          disabled={loading || !agentName}
        >
          {loading ? "Saving..." : "💾 Save to Supabase"}
        </Button>
      </div>
    </div>
  );
}
