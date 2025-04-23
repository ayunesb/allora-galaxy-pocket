
"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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

  const handlePersonaToggle = (p: string) => {
    setPersonas((prev) =>
      prev.includes(p) ? prev.filter((i) => i !== p) : [...prev, p]
    );
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

      <Button
        className="w-full"
        onClick={() => {
          console.log("Agent Built:", {
            agentName, personas, mission, capabilities, taskType, outputSchema, prompt
          });
        }}
      >
        🚀 Generate Agent Blueprint
      </Button>
    </div>
  );
}
