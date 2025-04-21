
import { useToast } from "@/components/ui/use-toast";
import GalaxyKitCard from "./GalaxyKitCard";

const kits = [
  { 
    title: "B2B SaaS Launch Kit", 
    description: "Includes funnel, onboarding, and AI-driven outreach." 
  },
  { 
    title: "Restaurant Turnaround", 
    description: "Includes labor benchmarks, margin targets, and daily checklist." 
  },
  { 
    title: "Creator Monetization Pack", 
    description: "Grow your audience and automate digital product sales." 
  }
];

const ExplorePage = () => {
  const { toast } = useToast();

  const handleUseKit = (title: string) => {
    toast({
      title: "Kit Selected",
      description: `You've selected the ${title}. Starting deployment...`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Galaxy Kit Explorer</h1>
        <p className="text-muted-foreground">
          Browse and deploy pre-built strategy kits for your business
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kits.map((kit) => (
          <GalaxyKitCard
            key={kit.title}
            title={kit.title}
            description={kit.description}
            onUse={() => handleUseKit(kit.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
