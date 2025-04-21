
import { Card, CardContent } from "@/components/ui/card";
import { CircleCheck, Clock } from "lucide-react";

interface MilestoneItemProps {
  label: string;
  achieved: boolean;
}

export default function MilestoneItem({ label, achieved }: MilestoneItemProps) {
  return (
    <Card>
      <CardContent className="py-4 flex items-center justify-between">
        <span className="text-sm">{label}</span>
        {achieved ? (
          <CircleCheck className="h-5 w-5 text-green-500" />
        ) : (
          <Clock className="h-5 w-5 text-muted-foreground" />
        )}
      </CardContent>
    </Card>
  );
}
