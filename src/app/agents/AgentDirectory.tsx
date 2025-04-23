
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Star, Shield, Code, Sparkles, 
  Users, ListChecks, BarChartHorizontal, BadgeCheck
} from "lucide-react";

interface AgentBlueprint {
  id: string;
  agent_name: string;
  mission: string;
  personas: string[];
  task_type: string;
  capabilities: string[];
}

// Map for agent icons based on name or task type
const getAgentIcon = (agent: AgentBlueprint) => {
  const typeMap: Record<string, React.ReactNode> = {
    'CEO': <Zap className="w-5 h-5 text-purple-500" />,
    'CMO': <Sparkles className="w-5 h-5 text-pink-500" />,
    'CTO': <Code className="w-5 h-5 text-blue-500" />,
    'CFO': <BarChartHorizontal className="w-5 h-5 text-emerald-500" />,
    'Closer': <BadgeCheck className="w-5 h-5 text-amber-500" />,
    'Team': <Users className="w-5 h-5 text-indigo-500" />,
    'generate-': <Sparkles className="w-5 h-5 text-blue-500" />,
    'suggest-': <ListChecks className="w-5 h-5 text-teal-500" />,
    'analyze-': <BarChartHorizontal className="w-5 h-5 text-amber-500" />
  };

  // Try to match by name first
  for (const [key, icon] of Object.entries(typeMap)) {
    if (agent.agent_name.includes(key)) {
      return icon;
    }
  }

  // Then try by task type
  for (const [key, icon] of Object.entries(typeMap)) {
    if (agent.task_type.includes(key)) {
      return icon;
    }
  }

  // Default
  return <Star className="w-5 h-5 text-slate-500" />;
};

export default function AgentDirectory() {
  const [agentBlueprints, setAgentBlueprints] = useState<AgentBlueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    const fetchAgentBlueprints = async () => {
      try {
        const { data, error } = await supabase
          .from('agent_blueprints')
          .select('id, agent_name, mission, personas, task_type, capabilities')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAgentBlueprints(data || []);
      } catch (error) {
        console.error('Error fetching agent blueprints:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentBlueprints();
  }, []);

  // Filter agents based on search input
  const filteredAgents = agentBlueprints.filter(agent => 
    filter === '' || 
    agent.agent_name.toLowerCase().includes(filter.toLowerCase()) ||
    agent.mission.toLowerCase().includes(filter.toLowerCase()) ||
    agent.task_type.toLowerCase().includes(filter.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading agents...</div>;
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-2xl font-bold">Agent Directory</h2>
        <div className="flex gap-3 mt-2 sm:mt-0">
          <input
            type="text"
            placeholder="Search agents..."
            className="px-3 py-1 border rounded-md"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="flex border rounded-md overflow-hidden">
            <button 
              onClick={() => setView('grid')} 
              className={`px-3 py-1 ${view === 'grid' ? 'bg-primary text-white' : 'bg-background'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setView('list')} 
              className={`px-3 py-1 ${view === 'list' ? 'bg-primary text-white' : 'bg-background'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getAgentIcon(agent)}
                    <CardTitle className="text-lg">{agent.agent_name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">{agent.task_type.split('-').pop()}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{agent.mission}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs mt-2">
                  <div className="flex flex-wrap gap-1 mt-2">
                    {agent.capabilities.slice(0, 3).map((capability, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px]">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <Badge variant="outline" className="text-[10px]">+{agent.capabilities.length - 3}</Badge>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span>Personas: </span>
                  {agent.personas.slice(0, 2).join(", ")}
                  {agent.personas.length > 2 && ` +${agent.personas.length - 2}`}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="p-3 hover:bg-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getAgentIcon(agent)}
                <div>
                  <div className="font-medium">{agent.agent_name}</div>
                  <div className="text-sm text-muted-foreground">{agent.mission}</div>
                </div>
              </div>
              <Badge variant="outline">{agent.task_type.split('-').pop()}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
