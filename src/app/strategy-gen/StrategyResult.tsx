
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StrategyResult({ industry, goal }: { 
  industry: string; 
  goal: string; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Strategy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">🧠 Based on your input:</p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>Industry: {industry}</li>
          <li>Goal: {goal}</li>
        </ul>
        <div className="rounded-lg bg-green-50 p-4 mt-4">
          <p className="text-sm text-green-700 font-medium">
            Suggested Action: Launch a 3-email nudge campaign + follow-up with AI assistant to demo key benefits. Deploy within 3 days.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
