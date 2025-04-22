
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StartupPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="bg-card dark:bg-gray-800 shadow-lg border border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Startup Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground dark:text-gray-300 mb-6">
            View startup metrics and growth indicators.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-background dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-medium">User Growth</h3>
              <p className="text-sm text-muted-foreground">Track user acquisition</p>
              <div className="mt-2 h-24 bg-background/50 dark:bg-gray-800/50 flex items-center justify-center text-muted-foreground">
                Chart Placeholder
              </div>
            </div>
            
            <div className="bg-background dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-medium">Conversion Rate</h3>
              <p className="text-sm text-muted-foreground">Monitor user conversions</p>
              <div className="mt-2 h-24 bg-background/50 dark:bg-gray-800/50 flex items-center justify-center text-muted-foreground">
                Chart Placeholder
              </div>
            </div>
            
            <div className="bg-background dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-medium">Revenue</h3>
              <p className="text-sm text-muted-foreground">Track monthly recurring revenue</p>
              <div className="mt-2 h-24 bg-background/50 dark:bg-gray-800/50 flex items-center justify-center text-muted-foreground">
                Chart Placeholder
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
