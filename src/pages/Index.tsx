
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-muted">
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
            <Button variant="outline">Watch Demo</Button>
          </div>
        </div>

        {/* Target Audience */}
        <div className="mt-16 text-center">
          <h2 className="text-lg font-semibold mb-3">Built for</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['Founders', 'Agencies', 'DTC Brands', 'E-Commerce', 'Creators'].map((tag) => (
              <span 
                key={tag}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 max-w-4xl">
          <div className="p-6 bg-card rounded-lg border">
            <p className="text-muted-foreground italic">
              "Allora OS replaced 5 tools and 2 consultants in my agency."
            </p>
            <p className="mt-2 text-sm font-medium">— Sarah K., Agency Owner</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <p className="text-muted-foreground italic">
              "It's like having a growth team that never sleeps."
            </p>
            <p className="mt-2 text-sm font-medium">— Mike R., E-commerce Founder</p>
          </div>
        </div>
      </div>
    </div>
  );
}
