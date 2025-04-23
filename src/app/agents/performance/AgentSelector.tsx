
interface AgentSelectorProps {
  agents: string[];
  selectedAgent: string;
  onChange: (agent: string) => void;
}

export function AgentSelector({ agents, selectedAgent, onChange }: AgentSelectorProps) {
  if (agents.length === 0) return null;
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">Select Agent:</label>
      <select 
        className="w-full max-w-xs border rounded p-2"
        value={selectedAgent}
        onChange={e => onChange(e.target.value)}
      >
        {agents.map(agent => (
          <option key={agent} value={agent}>
            {agent}
          </option>
        ))}
      </select>
    </div>
  );
}
