
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StrategyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Strategy Center</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              View and manage your current strategies.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Strategy Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create new marketing and growth strategies with AI assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
