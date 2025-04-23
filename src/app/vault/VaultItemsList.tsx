
import { useToast } from "@/hooks/use-toast";
import VaultCard from "./VaultCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const VaultItemsList = () => {
  const { toast } = useToast();
  const { data: strategies = [], refetch } = useQuery({
    queryKey: ['vault-strategies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      return data || [];
    }
  });

  const handleRemix = (title: string) => {
    toast({
      title: "Starting Remix",
      description: `Creating a new version of "${title}"`
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Strategy Vault</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy: any) => (
          <VaultCard
            key={strategy.id}
            id={strategy.id}
            title={strategy.title}
            description={strategy.description}
            impact_score={strategy.impact_score}
            is_public={strategy.is_public}
            onRemix={() => handleRemix(strategy.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default VaultItemsList;
