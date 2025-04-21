
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SwipeCardProps {
  title: string;
  summary: string;
  className?: string;
}

const SwipeCard = ({ title, summary, className }: SwipeCardProps) => {
  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-card-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
};

export default SwipeCard;
