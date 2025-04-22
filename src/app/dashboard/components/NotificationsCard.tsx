
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  notificationsCount: number;
}

export function NotificationsCard({ notificationsCount }: Props) {
  const navigate = useNavigate();
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Notifications</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          AI CEO has {notificationsCount} new suggestion{notificationsCount !== 1 ? 's' : ''}
        </p>
        <Button
          variant="link"
          className="mt-2 h-auto p-0"
          onClick={() => navigate("/notifications")}
        >
          View Growth Feed →
        </Button>
      </CardContent>
    </Card>
  );
}
