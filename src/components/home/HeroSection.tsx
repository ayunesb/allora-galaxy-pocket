
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <div className="text-center space-y-6 max-w-3xl">
      <h1 className="text-6xl font-bold tracking-tight">
        <span className="inline-block">🚀</span> Allora OS
      </h1>
      <p className="text-xl text-muted-foreground">
        Your AI CEO. One platform to plan, execute, and scale your business — with only 10% human input.
      </p>
      <div className="flex items-center justify-center gap-4 pt-4">
        <Link to="/onboarding">
          <Button className="gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/demo">
          <Button variant="outline" className="gap-2">
            🎓 Explore the Demo
          </Button>
        </Link>
      </div>
    </div>
  );
};
