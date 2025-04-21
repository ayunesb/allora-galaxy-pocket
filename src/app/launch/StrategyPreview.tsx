
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StrategyPreviewProps {
  title: string;
  summary: string;
}

export default function StrategyPreview({ title, summary }: StrategyPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
}
