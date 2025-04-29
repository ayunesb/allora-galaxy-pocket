
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Users, Brain, Zap } from "lucide-react";
import { useAgentCollaboration } from "@/hooks/useAgentCollaboration";
import { useToast } from "@/hooks/use-toast";
import AgentCollaborationPanel from "@/components/AgentCollaborationPanel";

export function AgentCollaborationHub() {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const { toast } = useToast();
  const { initializeCollaboration } = useAgentCollaboration();

  const startNewCollaboration = () => {
    const sessionId = initializeCollaboration();
    setActiveSession(sessionId);
    toast({
      title: "New collaboration started",
      description: "Agents are ready to collaborate"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Agent Collaboration</h2>
        <Button onClick={startNewCollaboration}>
          <Users className="h-4 w-4 mr-2" />
          New Collaboration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Collaboration</CardTitle>
          </CardHeader>
          <CardContent>
            {activeSession ? (
              <AgentCollaborationPanel 
                agentNames={['CEO', 'CMO', 'CFO', 'CTO']}
                onComplete={(sessionId, messages) => {
                  toast({
                    title: "Collaboration complete",
                    description: `${messages.length} messages exchanged`
                  });
                  setActiveSession(null);
                }}
              />
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                <p className="text-muted-foreground">
                  No active collaboration. Start one to begin agent interactions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['CEO', 'CMO', 'CTO', 'CFO'].map((agent) => (
                  <div key={agent} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{agent.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{agent}</p>
                        <p className="text-sm text-muted-foreground">Ready</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collaboration Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span>Memory Score</span>
                  </div>
                  <span className="font-medium">92</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>Success Rate</span>
                  </div>
                  <span className="font-medium">87%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
