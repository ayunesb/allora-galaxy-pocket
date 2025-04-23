
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plug, Plus, BarChart3, Code, TrendingUp } from "lucide-react";

export default function PluginsDashboard() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plugin Management</h1>
        <p className="text-muted-foreground">Build, discover, and manage plugins for your workspace</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Plug className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Plugin Builder</CardTitle>
            <CardDescription>Create and submit custom plugins</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/plugins/builder">
              <Button className="w-full">
                <Code className="mr-2 h-4 w-4" />
                Open Builder
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <BarChart3 className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Plugin Leaderboard</CardTitle>
            <CardDescription>View top performing plugins</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/plugins/leaderboard">
              <Button className="w-full" variant="outline">
                View Leaderboard
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Plus className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Submit Plugin</CardTitle>
            <CardDescription>Submit a new plugin to the marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/plugins/submit">
              <Button className="w-full" variant="outline">
                Submit Plugin
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <TrendingUp className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Plugin Performance</CardTitle>
            <CardDescription>View plugin ROI and earnings metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/plugins/performance">
              <Button className="w-full" variant="outline">
                View Performance
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
