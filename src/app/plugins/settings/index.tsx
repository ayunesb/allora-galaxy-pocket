
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PluginSettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Plugin Settings</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage global plugin settings and permissions.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configure API keys and access controls for plugins.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
