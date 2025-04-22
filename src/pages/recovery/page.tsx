
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecoveryPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>🔄 Recovery Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>View and manage recovery strategies and incident resolutions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
