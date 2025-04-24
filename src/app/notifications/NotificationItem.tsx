
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<void>;
}

export default function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  // Get the appropriate icon based on notification type
  const getIcon = () => {
    switch (notification.event_type) {
      case 'SYSTEM':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };
  
  return (
    <div className={`p-4 rounded-lg border ${notification.is_read ? 'bg-background' : 'bg-muted'}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">
            {notification.event_type}
          </p>
          {notification.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {notification.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <time className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </time>
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => onMarkAsRead(notification.id)}
              >
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
