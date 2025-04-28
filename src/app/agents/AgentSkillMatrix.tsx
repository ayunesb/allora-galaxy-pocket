
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentProfile } from "@/types/agent";

interface AgentSkillMatrixProps {
  agent: AgentProfile | null;
}

export default function AgentSkillMatrix({ agent }: AgentSkillMatrixProps) {
  if (!agent) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No agent selected</p>
        </CardContent>
      </Card>
    );
  }

  // Determine skill level based on memory score
  const getSkillLevel = (skillName: string) => {
    if (!agent.memory_score) return "Beginner";
    
    const score = agent.memory_score;
    if (score > 8000) return "Expert";
    if (score > 5000) return "Advanced";
    if (score > 2000) return "Intermediate";
    return "Beginner";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Skills & Tools</h3>
        
        <div className="space-y-6">
          {agent.enabled_tools && agent.enabled_tools.map((tool) => (
            <div key={tool} className="border-b pb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{tool}</span>
                <Badge variant="outline">{getSkillLevel(tool)}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${agent.memory_score ? Math.min(agent.memory_score / 100, 100) : 25}%` }}
                ></div>
              </div>
            </div>
          ))}
          
          {(!agent.enabled_tools || agent.enabled_tools.length === 0) && (
            <p className="text-muted-foreground">No skills configured for this agent</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
