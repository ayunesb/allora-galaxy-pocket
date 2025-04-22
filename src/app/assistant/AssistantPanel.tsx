
import { useState } from "react";
import { CommandBar } from "./components/CommandBar";
import { ResponseDisplay } from "./components/ResponseDisplay";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function AssistantPanel() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleCommand = async (command: string) => {
    setLoading(true);
    setResponse("Working on it...");

    try {
      // Mock responses - in real implementation this would call an API
      const mockResponses = {
        "write a cold email": "Subject: Quick idea to boost your leads\n\nHey there — I noticed you're scaling. Here's a way Allora OS can help...",
        "schedule a zoom": "✅ Call scheduled for Friday at 3pm with Alex",
        "tweet this": "Why use 8 tools when your AI CEO does it all? 👉 all-or-a.online"
      };

      const output = mockResponses[command.toLowerCase()] || "✅ Task submitted to AI assistant (live mode coming soon)";
      
      setTimeout(() => {
        setResponse(output);
        toast({
          title: "Task Complete",
          description: "Your AI assistant has processed your request",
        });
      }, 1200);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the command",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">🤖 AI Assistant</h2>
        <CommandBar onSubmit={handleCommand} isLoading={loading} />
        <ResponseDisplay response={response} isLoading={loading} />
      </Card>
    </div>
  );
}
