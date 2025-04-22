
import { useState } from "react";
import { ProductCard } from "./components/ProductCard";
import { CampaignGrid } from "./components/CampaignGrid";
import { LaunchButton } from "./components/LaunchButton";
import { useToast } from "@/hooks/use-toast";

const demoProduct = {
  name: "AI Booster Hoodie",
  description: "A hoodie made for startup founders with late-night energy. AI-powered strategy stitched in.",
  seo: {
    title: "Smart Founder Hoodie",
    tags: ["founder", "AI hoodie", "startup merch"]
  },
  campaigns: {
    email: "Introducing the AI Hoodie built for founders 💡",
    whatsapp: "Hey! We made a hoodie you'll actually launch something in. Want the link?",
    tiktok: "Show the hoodie, cut to a clip of you writing code or pitching, add trending music."
  }
};

export default function AutopilotPanel() {
  const [approved, setApproved] = useState(false);
  const { toast } = useToast();

  const handleLaunch = async () => {
    setApproved(true);
    toast({
      title: "Product Launch Started",
      description: "AI is deploying your product across all channels..."
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">🛍 Shopify Autopilot</h2>
      <p className="text-sm text-muted-foreground">Connected to your store • Ready to launch this product</p>

      <ProductCard product={demoProduct} />
      <CampaignGrid campaigns={demoProduct.campaigns} />
      <LaunchButton onLaunch={handleLaunch} approved={approved} />
    </div>
  );
}
