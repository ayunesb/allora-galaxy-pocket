
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const demos = [
  {
    title: "AI Strategy Generation",
    description: "Create personalized business strategies with AI",
    path: "/strategy-gen"
  },
  {
    title: "Plugin Marketplace",
    description: "Discover and enable powerful integrations",
    path: "/plugins/gallery"
  },
  {
    title: "AI Coaching Feed",
    description: "Get real-time insights and guidance",
    path: "/coaching/feed"
  }
];

export default function Explore() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">🧬 Strategy Demos</h2>
          <p className="text-lg text-muted-foreground">
            Preview strategies, plugins, and coaching insights
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {demos.map(demo => (
            <Card key={demo.title} className="hover:shadow-lg transition-shadow">
              <Link to={demo.path}>
                <CardHeader>
                  <CardTitle>{demo.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{demo.description}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
