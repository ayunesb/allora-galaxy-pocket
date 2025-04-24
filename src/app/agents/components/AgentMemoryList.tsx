
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAgentMemory } from "@/hooks/useAgentMemory";
import { formatDistanceToNow } from "date-fns";
import { Brain, Star, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AgentMemoryListProps {
  agentName: string;
}

export default function AgentMemoryList({ agentName }: AgentMemoryListProps) {
  const [filter, setFilter] = useState<'all' | 'history' | 'feedback' | 'preference'>('all');
  const { memories, isLoading, remixMemory } = useAgentMemory(agentName);

  const filteredMemories = memories.filter(memory => 
    filter === 'all' || memory.type === filter
  );

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'history': return <Badge variant="outline">History</Badge>;
      case 'preference': return <Badge variant="secondary">Preference</Badge>;
      case 'feedback': return <Badge variant="default">Feedback</Badge>;
      default: return null;
    }
  };

  const handleRemix = (memoryId: string) => {
    remixMemory(memoryId);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Agent Memory
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={filter === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'history' ? 'default' : 'outline'} 
              onClick={() => setFilter('history')}
            >
              History
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'feedback' ? 'default' : 'outline'} 
              onClick={() => setFilter('feedback')}
            >
              Feedback
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'preference' ? 'default' : 'outline'} 
              onClick={() => setFilter('preference')}
            >
              Preferences
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : filteredMemories.length > 0 ? (
            <div className="space-y-4">
              {filteredMemories.map(memory => (
                <div key={memory.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      {getTypeIcon(memory.type)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(memory.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{memory.context}</p>
                  
                  {memory.ai_feedback && (
                    <div className="bg-muted p-2 rounded-md mb-3">
                      <div className="text-xs font-medium mb-1">AI Feedback:</div>
                      <p className="text-xs text-muted-foreground">{memory.ai_feedback}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Remixed {memory.remix_count || 0} times
                      
                      {memory.ai_rating && (
                        <div className="ml-3 flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {memory.ai_rating}/10
                        </div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm" onClick={() => handleRemix(memory.id)}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Remix
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-md font-medium">No memories found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === 'all' 
                  ? `This agent hasn't stored any memories yet.` 
                  : `No ${filter} memories found for this agent.`}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
