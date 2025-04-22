
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface CommandBarProps {
  onSubmit: (command: string) => void;
  isLoading: boolean;
}

export function CommandBar({ onSubmit, isLoading }: CommandBarProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    onSubmit(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Write a cold email, schedule a Zoom, tweet this..."
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
