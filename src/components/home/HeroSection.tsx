
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-background to-muted py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          Build, Launch, and Scale Your Business — Powered by Autonomous AI
        </h1>
        
        <p className="text-xl text-muted-foreground">
          Allora OS is the first AI-native business operating system that adapts to your industry, 
          learns from your real-world results, and grows with you.
        </p>

        <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
          <div className="flex items-start gap-2">
            <ArrowRight className="h-5 w-5 mt-1 text-primary shrink-0" />
            <p>Personalized strategies tailored to your business type</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="h-5 w-5 mt-1 text-primary shrink-0" />
            <p>Adaptive AI that improves your marketing, sales, and operations every week</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="h-5 w-5 mt-1 text-primary shrink-0" />
            <p>Human-in-the-loop control with swipe-to-approve actions</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="h-5 w-5 mt-1 text-primary shrink-0" />
            <p>Fully integrated ecosystem of plugins, campaigns, and KPIs</p>
          </div>
        </div>

        <p className="text-lg font-medium">
          Your success is not just automated — it's adaptive.
        </p>

        <div className="pt-8 flex flex-col items-center gap-4">
          <Button size="lg" asChild className="h-14 px-8 text-lg">
            <Link to="/onboarding">
              Get My Launchpad 🚀
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Start building your AI-powered empire — no coding, no guesswork, no limits.
          </p>
        </div>
      </div>
    </section>
  );
};
