
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CampaignHeaderProps {
  title: string;
  description: string;
}

export function CampaignHeader({ title, description }: CampaignHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">🎯 {title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
