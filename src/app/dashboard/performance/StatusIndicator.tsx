
import { Card, CardContent } from "@/components/ui/card";

type StatusType = "green" | "yellow" | "red";

interface StatusIndicatorProps {
  status: StatusType;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusText = (status: StatusType) => {
    switch (status) {
      case "green":
        return "On track";
      case "yellow":
        return "Needs Review";
      case "red":
        return "Urgent Attention";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <span className={`h-3 w-3 rounded-full ${getStatusColor(status)}`} />
        <p className="text-sm text-muted-foreground">
          Status: {getStatusText(status)}
        </p>
      </CardContent>
    </Card>
  );
}
