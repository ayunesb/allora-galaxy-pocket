
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="kpi-alerts">KPI Alerts</Label>
          <Switch id="kpi-alerts" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="strategy-updates">Strategy Updates</Label>
          <Switch id="strategy-updates" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="system-alerts">System Alerts</Label>
          <Switch id="system-alerts" />
        </div>
      </CardContent>
    </Card>
  );
}
