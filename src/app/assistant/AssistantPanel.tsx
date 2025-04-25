
import { useState } from "react";
import { CommandBar } from "./components/CommandBar";
import { ResponseDisplay } from "./components/ResponseDisplay";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAgentContext } from "@/contexts/AgentContext";
import { AgentInfoCard } from "@/app/campaigns/components/AgentInfoCard";
import { useSystemLogs } from "@/hooks/useSystemLogs";

export default function AssistantPanel() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const { agentProfile, getAgentSystemPrompt } = useAgentContext();
  const { logActivity } = useSystemLogs();

  const handleCommand = async (command: string) => {
    setLoading(true);
    setResponse("Working on it...");

    try {
      // Mock responses - in real implementation this would call an API
      let output = "";
      const systemPrompt = getAgentSystemPrompt();
      
      // Mock responses - based on agent tone if available
      if (agentProfile?.tone === "friendly") {
        output = `Hey there! 😊 ${mockResponse(command)}`;
      } else if (agentProfile?.tone === "professional") {
        output = `I've completed your request. ${mockResponse(command)}`;
      } else if (agentProfile?.tone === "witty") {
        output = `Well, that was fun! 🎭 ${mockResponse(command)}`;
      } else {
        output = mockResponse(command);
      }
      
      setTimeout(() => {
        setResponse(output);
        
        // Log the assistant interaction with agent info
        if (agentProfile) {
          logActivity({
            event_type: "assistant_command",
            message: `Assistant (${agentProfile.agent_name}) processed command: ${command}`,
            meta: { 
              command,
              agent_id: agentProfile.id,
              agent_name: agentProfile.agent_name,
              tone: agentProfile.tone
            }
          });
        } else {
          logActivity({
            event_type: "assistant_command",
            message: `Assistant processed command: ${command}`,
            meta: { command }
          });
        }
        
        toast.success("Task Complete", {
          description: "Your AI assistant has processed your request"
        });
      }, 1200);
    } catch (error) {
      toast.error("Error", {
        description: "Failed to process the command"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate mock responses
  const mockResponse = (command: string) => {
    const mockResponses = {
      "write a cold email": "Subject: Quick idea to boost your leads\n\nHey there — I noticed you're scaling. Here's a way Allora OS can help...",
      "schedule a zoom": "✅ Call scheduled for Friday at 3pm with Alex",
      "tweet this": "Why use 8 tools when your AI CEO does it all? 👉 all-or-a.online"
    };

    return mockResponses[command.toLowerCase()] || "✅ Task submitted to AI assistant (live mode coming soon)";
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">🤖 AI Assistant</h2>
        {agentProfile && <AgentInfoCard />}
        <CommandBar onSubmit={handleCommand} isLoading={loading} />
        <ResponseDisplay response={response} isLoading={loading} />
      </Card>
    </div>
  );
}
