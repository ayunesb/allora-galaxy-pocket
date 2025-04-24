
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>🚀 Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome to your Allora OS Dashboard. Key insights and actions will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
