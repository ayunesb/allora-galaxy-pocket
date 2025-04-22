
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogoSection } from "./components/LogoSection";
import { LandingSection } from "./components/LandingSection";
import { SocialSection } from "./components/SocialSection";
import { toast } from "@/components/ui/use-toast";

export default function CreativeSuite() {
  const [approved, setApproved] = useState(false);

  const logo = "Allora AI // Growth OS";
  const landing = {
    headline: "The OS Your Business Didn't Know It Needed",
    subtext: "Let your AI CEO handle strategy, automation, and performance — while you approve, relax, and scale.",
    cta: "Get Started Now"
  };
  const captions = [
    "Just approved a new strategy in Allora OS. Took 12 seconds. 💡",
    "Why run 8 tools when your AI CEO can do it in one?",
    "Scale your biz with 90% AI. AlloraOS.com →"
  ];

  const handleApprove = () => {
    setApproved(true);
    toast({
      title: "Creative Kit Approved",
      description: "Your brand assets are now live and synced to campaigns + site 🎯",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">🎨 AI Creative Suite</h2>
      
      <LogoSection logoText={logo} />
      <LandingSection {...landing} />
      <SocialSection captions={captions} />

      <Button 
        onClick={handleApprove} 
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={approved}
      >
        ✅ Approve Creative Kit
      </Button>
    </div>
  );
}
