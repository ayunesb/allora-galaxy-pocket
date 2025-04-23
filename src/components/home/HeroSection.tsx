
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-background to-muted py-20 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
        Your AI executive team is ready.
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        Allora OS is the first 90% AI-powered business platform. From strategy to execution, 
        let your company run itself—with just your approval.
      </p>

      <div className="mt-8 flex justify-center gap-4 flex-wrap">
        <Button size="lg" asChild>
          <Link to="/demo" className="gap-2">
            🎓 Explore the Live Demo <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/pricing">See Plans</Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-4 italic">
        No login required · View-only mode · Resets daily
      </p>
    </section>
  );
};
