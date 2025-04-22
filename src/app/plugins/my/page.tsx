
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyPluginsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Plugins</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder for actual plugins */}
        <Card>
          <CardHeader>
            <CardTitle>No plugins installed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Visit the Plugin Marketplace to discover and install plugins.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
