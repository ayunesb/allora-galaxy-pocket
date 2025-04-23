
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AgentMemory } from "@/types/agent";

export function RemixLeaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['most-remixed-memories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('most_remixed_memories')
        .select('*');
      if (error) throw error;
      return data as AgentMemory[];
    }
  });

  if (isLoading) return <div>Loading leaderboard...</div>;
  if (!leaderboard?.length) return null;

  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-4">🔥 Most Remixed Strategies</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {leaderboard.map((memory) => (
          <Card key={memory.id}>
            <CardHeader className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{memory.agent_name}</h3>
                <p className="text-sm text-muted-foreground">{memory.context}</p>
                {memory.ai_rating && (
                  <Badge variant="secondary" className="mt-2">
                    ⭐ {memory.ai_rating}/5
                  </Badge>
                )}
              </div>
              <Badge>{memory.remix_count} remixes</Badge>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" asChild>
                <Link to={`/vault/create?from_memory=${memory.id}`}>
                  🔁 Remix
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
