import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, SendHorizonal, RefreshCw, Plus, MessageSquare } from 'lucide-react';
import { useAgentCollaboration } from '@/hooks/useAgentCollaboration';
import { useAgentLearningSystem } from '@/hooks/useAgentLearningSystem';
import { useAgentMemory } from '@/hooks/useAgentMemory';
import { useToast } from '@/hooks/use-toast';
import { AgentCollabMessage } from '@/types/agent';

export interface AgentCollaborationPanelProps {
  agentNames?: string[];
  onComplete?: (sessionId: string, messages: AgentCollabMessage[]) => void;
}

export default function AgentCollaborationPanel({ 
  agentNames = ['CEO', 'CMO', 'CTO', 'CFO'], 
  onComplete
}: AgentCollaborationPanelProps) {
  const [message, setMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(agentNames[0] || 'CEO');
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const { 
    sessionId, 
    messages, 
    isLoading, 
    initializeCollaboration, 
    logMessage, 
    loadCollaborationHistory 
  } = useAgentCollaboration();
  const { analyzeAgentPerformance } = useAgentLearningSystem();
  const { logAgentMemory } = useAgentMemory();

  useEffect(() => {
    const initialize = async () => {
      const newSessionId = initializeCollaboration();
      setIsInitialized(true);

      // Log initial session for the first agent
      if (agentNames.length > 0) {
        await logMessage(
          agentNames[0], 
          `Started a new collaboration session: ${newSessionId}`
        );
      }
    };

    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await logMessage(selectedAgent, message);
      setMessage('');

      // Also log to agent memory for learning
      await logAgentMemory({
        agentName: selectedAgent,
        context: message,
        type: 'history',
        is_user_submitted: true
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  const handleCompleteSession = async () => {
    if (messages.length === 0) return;

    try {
      // Analyze agent performance after collaboration
      const agentsInvolved = [...new Set(messages.map(m => m.agent))];
      
      for (const agent of agentsInvolved) {
        // Log to agent memory a summary of the collaboration
        await logAgentMemory({
          agentName: agent,
          context: `Participated in collaboration session ${sessionId} with ${agentsInvolved.filter(a => a !== agent).join(', ')}. Total messages: ${messages.filter(m => m.agent === agent).length}`,
          type: 'history'
        });
        
        // Analyze performance for learning
        await analyzeAgentPerformance(agent);
      }
      
      // Signal completion to parent component
      if (onComplete) {
        onComplete(sessionId, messages);
      }
      
      toast({
        title: 'Collaboration Complete',
        description: `Collaboration session with ${agentsInvolved.length} agents has concluded`
      });
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete collaboration session',
        variant: 'destructive'
      });
    }
  };

  const handleLoadPreviousSession = async () => {
    // This would open a dialog to select a previous session
    // For now, we'll just demonstrate loading the current session
    await loadCollaborationHistory();
    toast({
      title: 'Session Loaded',
      description: 'Previous collaboration session loaded'
    });
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Agent Collaboration</CardTitle>
        <CardDescription>
          Enable multiple AI agents to collaborate on complex tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[400px] overflow-y-auto border rounded-md p-4 bg-muted/30">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Initializing agent collaboration...
                </div>
              ) : (
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 mb-2 mx-auto text-muted-foreground/70" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={msg.id || index} className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={
                      msg.agent === 'CEO' ? 'bg-blue-100 text-blue-800' : 
                      msg.agent === 'CMO' ? 'bg-green-100 text-green-800' :
                      msg.agent === 'CTO' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'
                    }>
                      {msg.agent?.substring(0, 2) || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{msg.agent}</div>
                    <div className="text-sm mt-1 whitespace-pre-wrap">{msg.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Select 
            value={selectedAgent} 
            onValueChange={setSelectedAgent}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              {agentNames.map((agent) => (
                <SelectItem key={agent} value={agent}>{agent}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex flex-1 space-x-2">
            <Input
              placeholder={`Message as ${selectedAgent}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading || !isInitialized}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !isInitialized || !message.trim()}>
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleLoadPreviousSession}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Load Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => initializeCollaboration()}>
            <Plus className="h-4 w-4 mr-1" />
            New Session
          </Button>
        </div>
        
        <Button onClick={handleCompleteSession} disabled={isLoading || messages.length === 0}>
          Complete Session
        </Button>
      </CardFooter>
    </Card>
  );
}
