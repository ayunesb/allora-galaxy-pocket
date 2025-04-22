
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export default function PluginsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>🧩 Plugins Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Manage and explore plugins for your Allora OS workspace.</p>
          <div className="flex space-x-4">
            <Link to="/plugins/explore">
              <Button>Explore Plugins</Button>
            </Link>
            <Link to="/plugins/submit">
              <Button variant="outline">Submit Plugin</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
