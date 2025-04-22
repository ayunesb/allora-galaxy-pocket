
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useAgentContext } from "@/contexts/AgentContext";

interface CommandBarProps {
  onSubmit: (command: string) => void;
  isLoading: boolean;
}

export function CommandBar({ onSubmit, isLoading }: CommandBarProps) {
  const [input, setInput] = useState("");
  const { agentProfile } = useAgentContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    onSubmit(input);
    setInput("");
  };
  
  // Generate a placeholder text based on the agent profile
  const getPlaceholder = () => {
    if (!agentProfile) return "Write a cold email, schedule a Zoom, tweet this...";
    
    // Adjust placeholder based on agent role
    if (agentProfile.role.toLowerCase().includes("sales")) {
      return `Ask ${agentProfile.agent_name} about lead generation, cold emails...`;
    } 
    else if (agentProfile.role.toLowerCase().includes("marketing")) {
      return `Ask ${agentProfile.agent_name} about campaigns, content ideas...`;
    }
    else if (agentProfile.role.toLowerCase().includes("coach")) {
      return `Ask ${agentProfile.agent_name} for advice, strategies...`;
    }
    
    return `Ask ${agentProfile.agent_name} for assistance...`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={getPlaceholder()}
        className="flex-1"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !input.trim()}>
        <Send className="h-4 w-4 mr-2" />
        Ask AI
      </Button>
    </form>
  );
}
