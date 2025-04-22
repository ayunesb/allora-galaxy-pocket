import React from "react";
import { ScriptDialog } from "@/components/ScriptDialog";

export default function AgentProfile({ name, specialty, xp }) {
  const intro = `Agent ${name}: Expert in ${specialty}. XP: ${xp}`;
  const conversation = (
    <div>
      <b>User:</b> "How can you help me?"<br />
      <b>{name}:</b> "I specialize in {specialty}! Let’s optimize your workflow."
    </div>
  );

  return (
    <div className="border rounded-lg bg-background p-4 flex flex-col items-start">
      <div className="flex items-center mb-2">
        <div className="font-semibold text-lg">{name}</div>
        <ScriptDialog script={intro} testConversation={conversation} variant="ghost" buttonSize="sm" />
      </div>
      <div className="text-muted-foreground mb-1">{specialty}</div>
      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
        XP: {xp}
      </span>
    </div>
  );
}
