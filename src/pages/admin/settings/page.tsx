
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Manage workspace settings, integrations, and administrative configurations.</p>
        </CardContent>
      </Card>
    </div>
  );
}
