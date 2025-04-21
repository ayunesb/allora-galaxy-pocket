
import { useToast } from "@/hooks/use-toast";
import VaultCard from "./VaultCard";

const strategies = [
  { title: "Double Activation in 30 Days", description: "Based on user behavior tagging." },
  { title: "Lower Churn w/ Smart Nudges", description: "Combines time-based prompts + support." },
  { title: "Scale CAC-Positive Ads", description: "Based on Lookalike AI personas." }
];

const VaultItemsList = () => {
  const { toast } = useToast();

  const handleRemix = (title: string) => {
    toast({
      title: "Starting Remix",
      description: `Creating a new version of "${title}"`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Strategy Vault</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <VaultCard
            key={strategy.title}
            title={strategy.title}
            description={strategy.description}
            onRemix={() => handleRemix(strategy.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default VaultItemsList;
