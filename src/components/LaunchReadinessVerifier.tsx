
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle } from 'lucide-react';

export function LaunchReadinessVerifier() {
  // Example data - in a real app, this would come from an API
  const readinessScore = 92;
  const criticalTests = 15;
  const passedTests = 14;
  
  const categories = [
    { name: "Security", score: 96 },
    { name: "Performance", score: 88 },
    { name: "Functionality", score: 94 },
    { name: "User Experience", score: 91 },
  ];
  
  const pendingItems = [
    "Complete accessibility review",
    "Finalize error boundary implementations"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch Readiness</CardTitle>
        <CardDescription>
          System readiness assessment for production deployment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Overall Readiness</h4>
            <span className="text-2xl font-bold">{readinessScore}%</span>
          </div>
          <Progress value={readinessScore} className="h-2" />
        </div>
        
        <div>
          <h4 className="font-medium mb-3">Category Breakdown</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{category.name}</span>
                  <span>{category.score}%</span>
                </div>
                <Progress value={category.score} className="h-1" />
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <h4 className="font-medium">
              {passedTests} of {criticalTests} critical tests passed
            </h4>
          </div>
          
          {pendingItems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <h4 className="font-medium text-sm">Pending Items</h4>
              </div>
              <ul className="text-sm space-y-1 ml-6 list-disc">
                {pendingItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
