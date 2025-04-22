
import { useState } from "react";
import { CampaignHeader } from "./components/CampaignHeader";
import { ScriptCard } from "./components/ScriptCard";
import { ActionButtons } from "./components/ActionButtons";
import { useToast } from "@/hooks/use-toast";

const mockCampaign = {
  title: "Q2 Launch Plan",
  description: "AI-generated strategy for increasing awareness via TikTok and nurturing via WhatsApp.",
  scripts: {
    whatsapp: "Hey {{first_name}}, we just launched something amazing. Want early access?",
    email: "Subject: Launch 🚀 | Body: We've built something for teams like yours...",
    tiktok: "Create a 10s hook explaining the pain point, then show a demo or transformation.",
    meta: "Carousel Ad: Slide 1 = problem, Slide 2 = solution, Slide 3 = CTA",
    cold_call: "Hi, I'm calling because I saw you sell online — would you be open to a quick growth idea?",
    warm_call: "We connected last week. I have a launch ready if you're still interested!",
    zoom: "Training deck on 'Handling objections' is scheduled for Friday @ 11am with AI coach"
  }
};

export default function CampaignCenter() {
  const [approved, setApproved] = useState(false);
  const { toast } = useToast();

  const handleApprove = () => {
    setApproved(true);
    toast({
      title: "Campaign Approved",
      description: "AI system is deploying all tasks now..."
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <CampaignHeader title={mockCampaign.title} description={mockCampaign.description} />
      
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(mockCampaign.scripts).map(([channel, script]) => (
          <ScriptCard key={channel} channel={channel} script={script} />
        ))}
      </div>

      <ActionButtons onApprove={handleApprove} approved={approved} />
    </div>
  );
}
