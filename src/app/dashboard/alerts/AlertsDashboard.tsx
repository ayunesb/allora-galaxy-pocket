
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AlertsDashboard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Alert System</h2>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Configure Alerts
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-md">Alert History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active alerts at this time.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
