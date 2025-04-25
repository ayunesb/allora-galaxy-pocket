
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StrategyDetailContent() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Strategy Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Strategy details will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
