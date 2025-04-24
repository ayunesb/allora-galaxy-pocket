
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield } from "lucide-react";

interface SecurityScoreCardProps {
  score: number;
}

export function SecurityScoreCard({ score }: SecurityScoreCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Security Score</CardTitle>
        <Shield className={`h-5 w-5 ${score > 80 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{score}%</div>
        <Progress value={score} className="h-2 mt-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {score > 80 ? 'Good security posture' : 
           score > 50 ? 'Security needs improvement' : 
           'Critical security issues detected'}
        </p>
      </CardContent>
    </Card>
  );
}
