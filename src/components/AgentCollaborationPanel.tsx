
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Send, Calendar } from "lucide-react";
import { useAgentCollaboration } from "@/hooks/useAgentCollaboration";
import { useToast } from "@/hooks/use-toast";

interface AgentCollaborationPanelProps {
  agentNames: string[];
  onComplete?: (sessionId: string, messages: any[]) => void;
}

export default function AgentCollaborationPanel({ 
  agentNames,
  onComplete 
}: AgentCollaborationPanelProps) {
  const [userInput, setUserInput] = useState('');
  const [activeAgent, setActiveAgent] = useState<string>(agentNames[0]);
  const { 
    sessionId,
    messages,
    isLoading,
    initializeCollaboration,
    logMessage 
  } = useAgentCollaboration();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize a new collaboration session if none exists
    if (!sessionId) {
      initializeCollaboration();
    }
  }, [sessionId, initializeCollaboration]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    try {
      await logMessage(activeAgent, userInput);
      setUserInput('');
    } catch (error) {
      toast({
        description: "Failed to send message",
        variant: "destructive"
      });
      console.error("Message send error:", error);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(sessionId, messages);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Agents selector */}
      <div className="flex space-x-2 mb-3 overflow-x-auto p-2 bg-muted/20 rounded-md">
        {agentNames.map((agent) => (
          <Button 
            key={agent}
            size="sm"
            variant={activeAgent === agent ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveAgent(agent)}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {agent.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span>{agent}</span>
          </Button>
        ))}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto mb-4 bg-background rounded-md border p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Calendar className="h-6 w-6 mb-2" />
            <p>Start a new collaboration by sending a message.</p>
            <p className="text-xs mt-1">Session ID: {sessionId?.substring(0, 8)}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <Card key={msg.id} className={`${msg.agent === activeAgent ? 'bg-primary/10' : 'bg-muted/10'}`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {msg.agent.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{msg.agent}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{msg.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Input area */}
      <div className="flex gap-2 mt-auto">
        <div className="flex-1 relative">
          <Input
            placeholder={`Send message as ${activeAgent}...`}
            value={userInput}
            disabled={isLoading}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="w-full pr-10"
          />
        </div>
        <Button 
          disabled={isLoading || !userInput.trim()}
          onClick={handleSendMessage}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Complete button */}
      {onComplete && messages.length > 0 && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={handleComplete}
        >
          Complete Collaboration
        </Button>
      )}
    </div>
  );
}
