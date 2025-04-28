
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePromptPerformance } from "../hooks/usePromptPerformance";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';

interface PromptPerformanceStatsProps {
  agentName: string;
}

export default function PromptPerformanceStats({ agentName }: PromptPerformanceStatsProps) {
  const { data, isLoading, error, generatePromptRecommendations } = usePromptPerformance(agentName);
  const recommendations = generatePromptRecommendations();

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <LoadingSpinner size="md" label="Loading prompt performance..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorAlert 
        title="Failed to load prompt performance" 
        description={error.message} 
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prompt Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No prompt performance data available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const latestVersion = data[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border rounded p-3">
            <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold">{latestVersion.success_rate}%</p>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm font-medium text-muted-foreground">Feedback</p>
            <div className="flex items-center gap-4 mt-1">
              <div>
                <span className="text-lg font-bold text-green-600">+{latestVersion.upvotes}</span>
                <span className="text-xs text-muted-foreground ml-1">up</span>
              </div>
              <div>
                <span className="text-lg font-bold text-red-600">-{latestVersion.downvotes}</span>
                <span className="text-xs text-muted-foreground ml-1">down</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Recommendations</h4>
          <ul className="space-y-1">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-muted-foreground">• {rec}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
