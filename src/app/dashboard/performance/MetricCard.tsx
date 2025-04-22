
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  name: string;
  value: string | number;
}

export function MetricCard({ name, value }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{name}</p>
          <p className="text-2xl font-semibold mt-2">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
