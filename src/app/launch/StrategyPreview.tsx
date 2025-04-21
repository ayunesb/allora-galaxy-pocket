
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StrategyPreviewProps {
  title: string;
  description: string;
}

export default function StrategyPreview({ title, description }: StrategyPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
