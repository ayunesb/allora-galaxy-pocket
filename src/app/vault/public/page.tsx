
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PublicVault() {
  const { data: strategies = [] } = useQuery({
    queryKey: ["public-vault-strategies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(30);
      return data || [];
    }
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">🌍 Public Strategy Vault</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.length === 0 ? (
          <p className="ml-2 text-muted-foreground">No public strategies published yet.</p>
        ) : (
          strategies.map((strategy: any) => (
            <Card key={strategy.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{strategy.title}</CardTitle>
                <p className="text-xs mt-2 text-muted-foreground">
                  📈 Impact Score: {strategy.impact_score ?? "N/A"}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{strategy.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
