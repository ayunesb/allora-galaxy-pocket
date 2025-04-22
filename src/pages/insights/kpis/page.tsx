
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InsightsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>📊 Insights & KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Explore your business performance metrics and key insights.</p>
        </CardContent>
      </Card>
    </div>
  );
}
