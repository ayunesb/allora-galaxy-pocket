
import { useToast } from "@/hooks/use-toast";
import AgentProfile from "@/app/academy/AgentProfile";
import RemixedStrategy from "@/app/academy/RemixedStrategy";
import { FeedbackLog } from "@/types/campaign";

const agents = [
  { name: "CEO_Agent", specialty: "Company Launch", xp: 8000 },
  { name: "CampaignAgent", specialty: "Funnel Scaling", xp: 6200 },
  { name: "OpsAdvisor", specialty: "Team Efficiency", xp: 4100 }
];

const remixes = [
  { title: "B2B Cold Outreach", author: "CampaignAgent" },
  { title: "Daily Sales Tracker", author: "AICloser" }
];

const CoachingFeed = () => {
  const { toast } = useToast();

  const handleUseStrategy = (title: string, author: string) => {
    toast({
      title: "Strategy Selected",
      description: `Using "${title}" remixed by ${author}`,
    });
    
    // When logging feedback, ensure types match
    const feedbackLog: FeedbackLog = {
      strategy_title: title,
      action: 'used' as const, // Explicitly define as 'used' literal type
      created_at: new Date().toISOString()
    };
    
    // Now you can safely use this object for API calls
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Top Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentProfile key={agent.name} {...agent} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Wisdom Feed</h2>
          <div className="space-y-3">
            {remixes.map((remix, index) => (
              <RemixedStrategy
                key={index}
                {...remix}
                onUse={() => handleUseStrategy(remix.title, remix.author)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CoachingFeed;
