
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const demos = [
  { 
    title: "B2B Strategy Launch", 
    summary: "AI-built outreach + funnel optimization",
    path: "/strategy?template=b2b" 
  },
  { 
    title: "eCom Retargeting", 
    summary: "Meta pixel + AI follow-up SMS",
    path: "/strategy?template=ecom" 
  },
  { 
    title: "Creator Growth", 
    summary: "Email automation + product drops",
    path: "/strategy?template=creator" 
  }
];

export default function Explore() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl font-bold">🧬 Strategy Demo Gallery</h2>
          <p className="text-muted-foreground">
            Preview AI-generated strategy playbooks
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demos.map((demo, i) => (
            <Card key={i} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{demo.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <p className="text-muted-foreground flex-grow">{demo.summary}</p>
                <Button asChild className="mt-4">
                  <Link to={demo.path} className="flex items-center gap-2">
                    Try This Strategy
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
