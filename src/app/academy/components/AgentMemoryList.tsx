import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Award, Rocket } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { AgentMemory } from '@/types/agent';
import { MemoryComments } from '@/components/memory/MemoryComments';

interface AgentMemoryListProps {
  memories: AgentMemory[];
  isLoading: boolean;
}

export function AgentMemoryList({ memories, isLoading }: AgentMemoryListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="text-center py-8">Loading memories...</div>;
  }

  if (!memories.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No memories found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {memories.map((memory) => (
        <Card key={memory.id} className="flex flex-col">
          <CardHeader className="flex-row justify-between items-start space-y-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{memory.agent_name}</span>
              {memory.is_user_submitted && (
                <Badge variant="secondary" className="cursor-help">
                  👥 User
                </Badge>
              )}
              {memory.ai_rating && (
                <Badge variant="secondary" className="cursor-help">
                  ⭐ {memory.ai_rating}/5
                </Badge>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="success" className="cursor-help">
                      <Award className="h-3 w-3 mr-1" />
                      Success
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This strategy led to successful outcomes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(memory.timestamp), { addSuffix: true })}
            </span>
          </CardHeader>
          
          <CardContent className="flex-grow">
            <p className="text-sm mb-4">{memory.summary}</p>
            <div className="flex flex-wrap gap-2">
              {memory.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">#{tag}</Badge>
              ))}
            </div>
            <div className="mt-4">
              <MemoryComments memoryId={memory.id} />
            </div>
          </CardContent>
          
          <CardFooter className="justify-between">
            <span className="text-sm text-muted-foreground">
              🔁 Remixed: {memory.remix_count || 0} times
            </span>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => navigate(`/vault/create?from_memory=${memory.id}`)}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Remix Strategy
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
