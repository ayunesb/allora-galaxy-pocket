
import { AGENT_ROLES } from "@/lib/agents/AgentRoles";

export default function AgentDirectory() {
  return (
    <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
      {AGENT_ROLES.map((agent) => (
        <div key={agent.name} className="border p-4 rounded-xl shadow bg-background">
          <h3 className="text-lg font-bold flex items-center gap-1">
            <span className="text-xl">{agent.emoji}</span> {agent.name}
          </h3>
          <p className="text-muted-foreground text-sm">{agent.purpose}</p>
        </div>
      ))}
    </div>
  );
}
